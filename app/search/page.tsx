import { Suspense } from "react";
import SearchClient from "./search-client";

export const metadata = {
  title: "Search Catalog — Trendloop",
  description: "Search products by query, category, price range, and trending score. Find your Gen-Z style.",
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={
        <div className="text-center py-20 text-foreground/50 text-xs font-semibold uppercase tracking-widest">
          Loading Search Engine...
        </div>
      }>
        <SearchClient />
      </Suspense>
    </div>
  );
}
