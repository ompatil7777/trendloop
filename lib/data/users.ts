import { createClient } from "../supabase/server";
import { User, Board, Product } from "../mock-data/fixtures";

export async function getUserProfile(username: string): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching profile for "${username}":`, error);
    return null;
  }
  return data as User;
}

export async function getUserBoards(userId: string): Promise<Board[]> {
  const supabase = await createClient();
  
  // Load boards created by user
  const { data: boardsData, error: bErr } = await supabase
    .from("boards")
    .select("*, board_items(*)")
    .eq("user_id", userId);

  if (bErr) {
    console.error("Error fetching user boards:", bErr);
    return [];
  }

  return (boardsData as Board[]) || [];
}

export async function getBoardBySlug(
  username: string, 
  boardSlug: string
): Promise<(Board & { user: User; products: Product[] }) | null> {
  const supabase = await createClient();
  
  // Look up user first
  const user = await getUserProfile(username);
  if (!user) return null;

  // Fetch board details and pins
  const { data: board, error: bErr } = await supabase
    .from("boards")
    .select("*, board_items(*)")
    .eq("user_id", user.id)
    .eq("slug", boardSlug)
    .maybeSingle();

  if (bErr || !board) {
    console.error(`Error fetching board "${boardSlug}":`, bErr);
    return null;
  }

  const pinnedProductIds = board.board_items.map((item: any) => item.product_id);
  
  let products: Product[] = [];
  if (pinnedProductIds.length > 0) {
    const { data: prods, error: pErr } = await supabase
      .from("products")
      .select("*")
      .in("id", pinnedProductIds);
      
    if (!pErr && prods) {
      products = prods as Product[];
    }
  }

  return {
    ...board,
    items: board.board_items,
    user,
    products
  };
}
