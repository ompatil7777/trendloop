import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "../../../../lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const retailer = searchParams.get("retailer") || "amazon";
    
    // Extract referral details
    const referer = request.headers.get("referer") || "direct";
    const utmSource = searchParams.get("utm_source") || "";
    const utmMedium = searchParams.get("utm_medium") || "";
    const utmCampaign = searchParams.get("utm_campaign") || "";
    
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. Fetch active user if logged in (cookie-based)
    const { data: { user } } = await supabase.auth.getUser();
    
    // 2. Resolve target affiliate link from Supabase (bypasses RLS)
    const { data: affLink, error: affErr } = await adminSupabase
      .from("affiliate_links")
      .select("*")
      .eq("product_id", productId)
      .eq("retailer", retailer)
      .eq("is_active", true)
      .maybeSingle();

    let destinationUrl = "";
    
    if (affErr || !affLink) {
      console.warn(`[Affiliate redirectional Warning] Link not found for product ${productId} and retailer ${retailer}. Falling back to default search.`);
      
      // Fetch product name for search fallback
      const { data: prod } = await supabase
        .from("products")
        .select("name, brand")
        .eq("id", productId)
        .maybeSingle();
      
      const query = prod ? encodeURIComponent(`${prod.brand} ${prod.name}`) : productId;
      
      switch (retailer) {
        case "amazon":
          destinationUrl = `https://www.amazon.in/s?k=${query}&tag=trendloop-21`;
          break;
        case "flipkart":
          destinationUrl = `https://www.flipkart.com/search?q=${query}&affid=trendloop`;
          break;
        case "nike":
          destinationUrl = `https://www.nike.com/in/w?q=${query}`;
          break;
        case "keychron":
          destinationUrl = `https://keychron.in/search?q=${query}`;
          break;
        default:
          destinationUrl = `https://www.amazon.in/s?k=${query}`;
      }
    } else {
      destinationUrl = affLink.raw_url;
    }

    // 3. Log click event in click_events table (if link resolved or fallback created)
    if (affLink) {
      const { error: logErr } = await adminSupabase
        .from("click_events")
        .insert({
          product_id: productId,
          affiliate_link_id: affLink.id,
          user_id: user?.id || null,
          session_id: request.cookies.get("sb-access-token")?.value || "anonymous-session",
          referrer: referer,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign
        });

      if (logErr) {
        console.error("Error logging click event to Supabase:", logErr);
      } else {
        console.log(`[Affiliate redirect logged] Product: ${productId}, Retailer: ${retailer}`);
      }
    }

    // 4. Issue 302 Redirection
    return NextResponse.redirect(destinationUrl, 302);
  } catch (error) {
    console.error("Redirection server handler crash:", error);
    return new NextResponse("Redirection error", { status: 500 });
  }
}
