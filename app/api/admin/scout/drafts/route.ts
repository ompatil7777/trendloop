import { NextRequest, NextResponse } from "next/server";
import { verifyAdminServer } from "../../../../../lib/supabase/admin-check";
import { createAdminClient } from "../../../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Verify admin role
    await verifyAdminServer();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "draft";
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy") || "trend_score";
    
    const supabase = createAdminClient();
    
    let query = supabase
      .from("draft_products")
      .select("*, product_candidates(*), affiliate_links(*)")
      .eq("status", status);

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (sortBy === "trend_score") {
      query = query.order("trend_score", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: drafts, error } = await query;

    if (error) {
      console.error("Error fetching drafts list:", error);
      return NextResponse.json({ error: "Failed to query draft list." }, { status: 500 });
    }

    return NextResponse.json({ drafts });
  } catch (err: any) {
    console.error("Drafts list handler error:", err);
    return NextResponse.json({ error: "Failed authorization check" }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin role
    const admin = await verifyAdminServer();
    const body = await request.json();
    const { action, draftId, draftIds, status, name, price, category, subcategory, tags, affiliateUrl, networkName } = body;

    const supabase = createAdminClient();

    // =========================================================================
    // ACTION: PUBLISH DRAFT (Single Atomic Transaction via RPC)
    // =========================================================================
    if (action === "publish") {
      if (!draftId || !affiliateUrl || !networkName) {
        return NextResponse.json({ error: "Missing draft ID, affiliate link, or network name." }, { status: 400 });
      }

      const { data: productId, error: rpcErr } = await supabase.rpc("publish_draft_product", {
        p_draft_id: draftId,
        p_admin_id: admin.id,
        p_affiliate_url: affiliateUrl,
        p_network_name: networkName,
      });

      if (rpcErr) {
        console.error("RPC publish failed:", rpcErr);
        return NextResponse.json({ error: `Publication failed: ${rpcErr.message}` }, { status: 500 });
      }

      return NextResponse.json({ message: "Draft product published successfully.", productId });
    }

    // =========================================================================
    // ACTION: BULK PUBLISH DRAFTS (Independent atomic RPC transactions)
    // =========================================================================
    if (action === "bulk-publish") {
      const items = body.items || []; // Array of { draftId, affiliateUrl, networkName }
      if (items.length === 0) {
        return NextResponse.json({ error: "No items provided for bulk publish." }, { status: 400 });
      }

      const published: string[] = [];
      const skipped: { draftId: string; reason: string }[] = [];

      for (const item of items) {
        if (!item.affiliateUrl || !item.networkName) {
          skipped.push({ draftId: item.draftId, reason: "Missing affiliate URL or network configuration." });
          continue;
        }

        try {
          const { data: productId, error: rpcErr } = await supabase.rpc("publish_draft_product", {
            p_draft_id: item.draftId,
            p_admin_id: admin.id,
            p_affiliate_url: item.affiliateUrl,
            p_network_name: item.networkName,
          });

          if (rpcErr) {
            skipped.push({ draftId: item.draftId, reason: rpcErr.message });
          } else {
            published.push(item.draftId);
          }
        } catch (err: any) {
          skipped.push({ draftId: item.draftId, reason: err.message || "Unknown transaction crash" });
        }
      }

      return NextResponse.json({
        message: "Bulk publish execution completed.",
        publishedCount: published.length,
        skippedCount: skipped.length,
        published,
        skipped,
      });
    }

    // =========================================================================
    // ACTION: UPDATE STATUS (approved / rejected)
    // =========================================================================
    if (action === "update-status") {
      if (!draftId || !status) {
        return NextResponse.json({ error: "Missing draft ID or status." }, { status: 400 });
      }

      const { error: updateErr } = await supabase
        .from("draft_products")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", draftId);

      if (updateErr) {
        return NextResponse.json({ error: "Failed to update draft status." }, { status: 500 });
      }

      // Log action in approval history
      await supabase
        .from("approval_history")
        .insert({
          draft_product_id: draftId,
          admin_id: admin.id,
          action: status,
          notes: `Status changed to ${status}`,
        });

      return NextResponse.json({ message: "Draft status updated." });
    }

    // =========================================================================
    // ACTION: EDIT DRAFT METADATA
    // =========================================================================
    if (action === "edit") {
      if (!draftId) {
        return NextResponse.json({ error: "Missing draft ID." }, { status: 400 });
      }

      const { error: editErr } = await supabase
        .from("draft_products")
        .update({
          name,
          price,
          category,
          subcategory,
          tags_json: tags || [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", draftId);

      if (editErr) {
        return NextResponse.json({ error: "Failed to update draft metadata." }, { status: 500 });
      }

      // Log edit
      await supabase
        .from("approval_history")
        .insert({
          draft_product_id: draftId,
          admin_id: admin.id,
          action: "edited",
          notes: "Metadata manually edited by administrator",
        });

      return NextResponse.json({ message: "Draft details updated successfully." });
    }

    // =========================================================================
    // ACTION: DELETE DRAFT
    // =========================================================================
    if (action === "delete") {
      if (!draftId) {
        return NextResponse.json({ error: "Missing draft ID." }, { status: 400 });
      }

      const { error: delErr } = await supabase
        .from("draft_products")
        .delete()
        .eq("id", draftId);

      if (delErr) {
        return NextResponse.json({ error: "Failed to delete draft." }, { status: 500 });
      }

      return NextResponse.json({ message: "Draft deleted." });
    }

    // =========================================================================
    // ACTION: BULK DELETE
    // =========================================================================
    if (action === "bulk-delete") {
      if (!draftIds || draftIds.length === 0) {
        return NextResponse.json({ error: "No draft IDs provided." }, { status: 400 });
      }

      const { error: delErr } = await supabase
        .from("draft_products")
        .delete()
        .in("id", draftIds);

      if (delErr) {
        return NextResponse.json({ error: "Failed to bulk delete drafts." }, { status: 500 });
      }

      return NextResponse.json({ message: "Bulk delete completed." });
    }

    // =========================================================================
    // ACTION: BULK UPDATE STATUS
    // =========================================================================
    if (action === "bulk-status") {
      if (!draftIds || draftIds.length === 0 || !status) {
        return NextResponse.json({ error: "Missing fields." }, { status: 400 });
      }

      const { error: upErr } = await supabase
        .from("draft_products")
        .update({ status, updated_at: new Date().toISOString() })
        .in("id", draftIds);

      if (upErr) {
        return NextResponse.json({ error: "Failed to bulk update status." }, { status: 500 });
      }

      // Log histories
      const historyLogs = draftIds.map((id: string) => ({
        draft_product_id: id,
        admin_id: admin.id,
        action: status,
        notes: `Bulk status update to ${status}`,
      }));

      await supabase.from("approval_history").insert(historyLogs);

      return NextResponse.json({ message: "Bulk status update completed." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  } catch (err: any) {
    console.error("Drafts management API crash:", err);
    return NextResponse.json({ error: "Internal server error occurred." }, { status: 500 });
  }
}
