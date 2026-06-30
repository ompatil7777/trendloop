import { NextRequest, NextResponse } from "next/server";
import { verifyAdminServer } from "../../../../../lib/supabase/admin-check";
import { createAdminClient } from "../../../../../lib/supabase/server";
import { runScoutJob } from "../../../../../lib/scout/ai-scout";
import { after } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify user is authorized admin
    const adminProfile = await verifyAdminServer();
    
    // 2. Extract payload
    const body = await request.json();
    const { query, count, category, minRating, minReviews, minTrendScore } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Missing or invalid search query parameter." }, { status: 400 });
    }

    const filters = {
      category: category || undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      minReviews: minReviews ? parseInt(minReviews, 10) : undefined,
      minTrendScore: minTrendScore ? parseInt(minTrendScore, 10) : undefined,
    };

    const limitCount = count ? parseInt(count, 10) : 10;

    const supabase = createAdminClient();

    // 3. Insert research job tracker record
    const { data: job, error: jobErr } = await supabase
      .from("research_jobs")
      .insert({
        admin_id: adminProfile.id,
        query_text: query.trim(),
        filters_json: {
          limit: limitCount,
          ...filters
        },
        status: "pending",
      })
      .select()
      .single();

    if (jobErr || !job) {
      console.error("Error inserting research job:", jobErr);
      return NextResponse.json({ error: "Could not create research job record." }, { status: 500 });
    }

    // 4. Trigger the job processing in the background after the response resolves
    // This prevents API request timeouts on hosting platforms (e.g. Vercel)
    after(async () => {
      console.log(`[AI Scout API] Starting background execution for Job: ${job.id}`);
      await runScoutJob(
        job.id,
        adminProfile.id,
        query.trim(),
        { ...filters, priceMin: undefined, priceMax: undefined } // Extendable search bounds
      );
    });

    return NextResponse.json({
      message: "Research job queued successfully.",
      jobId: job.id,
      status: "pending",
    }, { status: 202 });

  } catch (err: any) {
    console.error("AI Scout run API handler error:", err);
    return NextResponse.json({ error: "Internal server error occurred." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin
    await verifyAdminServer();

    const supabase = createAdminClient();
    
    // Fetch active/recent jobs
    const { data: jobs, error } = await supabase
      .from("research_jobs")
      .select("*, import_logs(*)")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({ jobs });
  } catch (err: any) {
    console.error("AI Scout jobs list fetch failed:", err);
    return NextResponse.json({ error: "Failed to list scout jobs" }, { status: 500 });
  }
}
