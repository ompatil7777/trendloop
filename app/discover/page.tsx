import { getProducts } from "../../lib/data/products";
import DiscoverClient from "./discover-client";

export const metadata = {
  title: "Discover Trends — Trendloop",
  description: "Browse the full Gen-Z trends masonry grid. Infinite scroll streetwear, gaming setups, anime artifacts, and cozy room items.",
};

export default async function DiscoverPage() {
  // Fetch initial batch on server side for SEO and fast loading
  const { products: initialProducts, totalCount } = await getProducts({
    sortBy: "trending",
    limit: 12,
    offset: 0
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2 border-b border-card-border pb-5">
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground font-display">
          Discover Feed
        </h1>
        <p className="text-xs sm:text-sm text-foreground/50 max-w-md leading-relaxed">
          Scroll through the latest aesthetics. Save what you like, tap to buy at the retailer.
        </p>
      </div>

      {/* High-fidelity client component managing infinite scroll */}
      <DiscoverClient initialProducts={initialProducts} initialTotal={totalCount} />
    </div>
  );
}
