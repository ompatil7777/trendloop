"use client";

import ProductCard from "../feed/ProductCard";
import { Product } from "../../lib/mock-data/fixtures";

interface RelatedRailProps {
  products: Product[];
}

export default function RelatedRail({ products }: RelatedRailProps) {
  if (!products.length) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between border-b border-card-border pb-3">
        <h3 className="text-lg font-bold tracking-tight text-foreground uppercase">
          You might also like
        </h3>
        <span className="text-xs text-foreground/40 font-semibold tracking-wider uppercase">
          Trending Alternatives
        </span>
      </div>

      {/* HORIZONTAL CAROUSEL */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar fade-mask">
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-64 md:w-72">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
