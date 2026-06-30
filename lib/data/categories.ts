import { createClient } from "../supabase/server";
import { Category } from "../mock-data/fixtures";

export interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null);

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data || [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching category:", error);
    return null;
  }
  return data;
}

export async function getSubcategories(parentSlug: string): Promise<Category[]> {
  const supabase = await createClient();
  
  // Get parent category ID
  const { data: parent, error: parentErr } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", parentSlug)
    .is("parent_id", null)
    .maybeSingle();

  if (parentErr || !parent) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("parent_id", parent.id);

  if (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
  return data || [];
}

export async function getCategoriesWithSubs(): Promise<CategoryWithSubcategories[]> {
  const supabase = await createClient();
  
  // Fetch all parent categories
  const { data: parents, error: pErr } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null);

  if (pErr || !parents) return [];

  // Fetch all child subcategories
  const { data: children, error: cErr } = await supabase
    .from("categories")
    .select("*")
    .not("parent_id", "is", null);

  const subcategories = children || [];

  return parents.map((parent) => ({
    ...parent,
    subcategories: subcategories.filter((c) => c.parent_id === parent.id),
  }));
}
