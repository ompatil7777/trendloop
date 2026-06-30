import { createClient } from "../supabase/server";
import { Guide, Product } from "../mock-data/fixtures";

export async function getGuides(): Promise<Guide[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching guides:", error);
    return [];
  }
  return (data as Guide[]) || [];
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching guide "${slug}":`, error);
    return null;
  }
  return data as Guide;
}

export async function getProductsForGuide(guideId: string): Promise<Product[]> {
  const supabase = await createClient();
  
  // Fetch relation array from guide row
  const { data: guide, error: guideErr } = await supabase
    .from("guides")
    .select("related_product_ids")
    .eq("id", guideId)
    .maybeSingle();

  if (guideErr || !guide) return [];

  // Parse related product IDs and fetch products matching them
  const productIds = guide.related_product_ids as string[];
  if (!productIds || productIds.length === 0) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);

  if (error) {
    console.error("Error fetching guide related products:", error);
    return [];
  }
  return (data as Product[]) || [];
}
