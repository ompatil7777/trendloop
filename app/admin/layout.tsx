import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, PlusCircle, Link2, FileText, Settings, ArrowLeft, Sparkles, ListTodo, BarChart3 } from "lucide-react";
import { verifyAdminServer } from "../../lib/supabase/admin-check";

export const metadata: Metadata = {
  title: "Admin Panel — Trendloop",
  description: "Manage product catalogs, outbound affiliate links, and click tracking metrics.",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side authentication and role authorization
  await verifyAdminServer();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex font-sans text-foreground">
      {/* 1. ADMIN SIDEBAR PANELS */}
      <aside className="w-64 border-r border-card-border bg-white dark:bg-zinc-900 flex flex-col justify-between flex-shrink-0 h-screen sticky top-0">
        <div className="p-6 space-y-8">
          {/* Logo link back to site */}
          <div className="flex flex-col gap-2">
            <Link href="/" className="inline-flex items-center gap-1 text-foreground/45 hover:text-foreground text-[10px] font-bold uppercase tracking-widest transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Main Website
            </Link>
            <span className="text-sm font-black tracking-widest font-display text-foreground uppercase pt-1">
              Trendloop Admin
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1.5">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-foreground/60 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/admin?action=add-product"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-foreground/60 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Add Product
            </Link>
            <Link
              href="/admin?action=links"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-foreground/60 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Link2 className="w-4 h-4" />
              Affiliate Links
            </Link>
            <Link
              href="/admin?action=guides"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-foreground/60 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <FileText className="w-4 h-4" />
              SEO Guides
            </Link>

            <div className="h-px bg-card-border my-2" />
            <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/35 px-3 mb-1">Curation Engine</div>

            <Link
              href="/admin?action=scout"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-foreground/60 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-gold" />
              AI Product Scout
            </Link>
            <Link
              href="/admin?action=drafts"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-foreground/60 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ListTodo className="w-4 h-4" />
              Draft Queue
            </Link>
            <Link
              href="/admin?action=scout-analytics"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-foreground/60 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Scout Analytics
            </Link>
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-6 border-t border-card-border flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-widest text-foreground/35">
          <Settings className="w-4 h-4" />
          <span>v1.0.0 (Phase 1 Mock)</span>
        </div>
      </aside>

      {/* 2. ADMIN MAIN VIEWPORT */}
      <main className="flex-grow p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
