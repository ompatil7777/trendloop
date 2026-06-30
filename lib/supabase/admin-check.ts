import { createClient } from "./server";
import { notFound } from "next/navigation";

/**
 * Server-side helper to verify if the active session belongs to an admin user.
 * Throws a Next.js 404 (notFound) if unauthorized or unauthenticated,
 * effectively preventing non-admin access to secure pages.
 */
export async function verifyAdminServer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Query database users table for role
  const { data: profile, error } = await supabase
    .from("users")
    .select("id, username, role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || profile.role !== "admin") {
    notFound();
  }

  return profile;
}
