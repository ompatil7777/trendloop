"use server";

import { createClient } from "../supabase/server";
import { Product } from "../mock-data/fixtures";

export interface GetProductsParams {
  categorySlug?: string;
  subcategorySlug?: string;
  searchQuery?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: "trending" | "newest" | "price-low" | "price-high" | "popular";
  limit?: number;
  offset?: number;
  trendTheme?: string;
}

/**
 * Fetches products list from Supabase, applying filters and sorting.
 */
export async function getProducts(params: GetProductsParams = {}): Promise<{ products: Product[]; totalCount: number }> {
  const supabase = await createClient();
  let query = supabase.from("products").select("*", { count: "exact" });

  // 0. Filter by trend theme
  if (params.trendTheme) {
    query = query.contains("trend_theme", [params.trendTheme]);
  }

  // 1. Filter by parent category slug
  if (params.categorySlug) {
    const { data: parentCat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.categorySlug)
      .is("parent_id", null)
      .maybeSingle();

    if (parentCat) {
      // Find subcategories belonging to this parent category
      const { data: subCats } = await supabase
        .from("categories")
        .select("id")
        .eq("parent_id", parentCat.id);

      const subIds = (subCats || []).map((s) => s.id);

      if (subIds.length > 0) {
        // Match items where category is parent OR subcategory is under parent
        query = query.or(`category_id.eq.${parentCat.id},subcategory_id.in.(${subIds.join(",")})`);
      } else {
        query = query.eq("category_id", parentCat.id);
      }
    }
  }

  // 2. Filter by subcategory slug
  if (params.subcategorySlug) {
    const { data: subCat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.subcategorySlug)
      .not("parent_id", "is", null)
      .maybeSingle();

    if (subCat) {
      query = query.eq("subcategory_id", subCat.id);
    }
  }

  // 3. Filter by search query
  if (params.searchQuery) {
    const q = params.searchQuery.trim();
    query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%,description.ilike.%${q}%`);
  }

  // 4. Filter by price min/max limits
  if (params.priceMin !== undefined && !isNaN(params.priceMin)) {
    query = query.gte("price", params.priceMin);
  }
  if (params.priceMax !== undefined && !isNaN(params.priceMax)) {
    query = query.lte("price", params.priceMax);
  }

  // 5. Apply sorting
  const sorting = params.sortBy || "trending";
  switch (sorting) {
    case "trending":
      query = query.order("trending_score", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "price-low":
      query = query.order("price", { ascending: true });
      break;
    case "price-high":
      query = query.order("price", { ascending: false });
      break;
    case "popular":
      query = query
        .order("save_count", { ascending: false })
        .order("view_count", { ascending: false });
      break;
    default:
      query = query.order("trending_score", { ascending: false });
  }

  // 6. Pagination ranges
  const offset = params.offset || 0;
  const limit = params.limit || 12;
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error executing getProducts query:", error);
    return { products: [], totalCount: 0 };
  }

  return {
    products: (data as Product[]) || [],
    totalCount: count || 0,
  };
}

/**
 * Fetch a single product by its unique slug.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching product by slug "${slug}":`, error);
    return null;
  }
  return data as Product;
}

/**
 * Fetch featured products (Hero banners, standout pieces).
 */
export async function getFeaturedProducts(limit = 5): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .order("trending_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
  return (data as Product[]) || [];
}

/**
 * Fetch trending products.
 */
export async function getTrendingProducts(limit = 10): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("trending_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching trending products:", error);
    return [];
  }
  return (data as Product[]) || [];
}

/**
 * Fetch products belonging to a specific Trend Theme (e.g. 'gimme-gummy', 'afrohemian-decor', 'doily-era').
 */
export async function getProductsByTrendTheme(themeSlug: string, limit = 6): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .contains("trend_theme", [themeSlug])
    .order("trending_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`Error fetching products by trend theme "${themeSlug}":`, error);
    return [];
  }
  return (data as Product[]) || [];
}


/**
 * Fetch related products (e.g. products in the same category, excluding active one).
 */
export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  const supabase = await createClient();
  
  // Find current product category
  const { data: activeProduct } = await supabase
    .from("products")
    .select("category_id")
    .eq("id", productId)
    .maybeSingle();

  if (!activeProduct) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", activeProduct.category_id)
    .neq("id", productId)
    .order("trending_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
  return (data as Product[]) || [];
}

/**
 * Fetch products under a specific price threshold.
 */
export async function getProductsUnderPrice(maxPrice: number, limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .lte("price", maxPrice)
    .order("trending_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching products under price:", error);
    return [];
  }
  return (data as Product[]) || [];
}

/**
 * Tracks click event in console (Redirection handles database writes).
 */
export async function logAffiliateClick(productId: string, retailer: string): Promise<boolean> {
  console.log(`[Affiliate logAction] Redirect tracking triggered for ${productId} to ${retailer}`);
  return true;
}

/**
 * Fetch a list of products matching an array of unique UUIDs.
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("id", ids);

  if (error) {
    console.error("Error fetching products by ids:", error);
    return [];
  }
  return (data as Product[]) || [];
}
