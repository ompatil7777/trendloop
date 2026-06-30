import { getProducts } from "../../lib/data/products";
import DiscoverClient from "../discover/discover-client";
import { Flame } from "lucide-react";

export const metadata = {
  title: "Trending Now — Gen-Z Trends — Trendloop",
  description: "Browse the hottest items saved, shared, and clicked by the Trendloop community this week.",
};

export default async function TrendingPage() {
  const { products: initialProducts, totalCount } = await getProducts({
    sortBy: "trending",
    limit: 12,
    offset: 0
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="space-y-2 border-b border-card-border pb-5">
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground font-display flex items-center gap-2.5">
          <Flame className="w-6 h-6 text-gold fill-gold/10" />
          Hottest Items
        </h1>
        <p className="text-xs sm:text-sm text-foreground/50 max-w-md leading-relaxed">
          The most viewed, saved, and shared aesthetics across streetwear, setup mods, and room decors.
        </p>
      </div>

      <DiscoverClient initialProducts={initialProducts} initialTotal={totalCount} />
    </div>
  );
}
