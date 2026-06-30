"use client";

import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import SkeletonCard from "./SkeletonCard";
import { Product } from "../../lib/mock-data/fixtures";

interface MasonryGridProps {
  products: Product[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function MasonryGrid({
  products,
  isLoading,
  hasMore,
  onLoadMore
}: MasonryGridProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Setup Intersection Observer for infinite scrolling
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" } // Pre-fetch before user reaches the bottom
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, isLoading, onLoadMore, loadMoreRef]);

  /*
   * =========================================================================
   * NOTE FOR FUTURE VIRTUALIZATION (E.G. REACT-VIRTUOSO / REACT-WINDOW)
   * =========================================================================
   * To achieve a true CSS-only masonry flow, this component splits the flat
   * `products` array into 2 columns (mobile/tablet) or 3 columns (desktop)
   * and maps each sub-array in parallel.
   * 
   * If replacing this with a virtualized grid library:
   * 1. DO NOT split the array into column columns.
   * 2. Feed the flat `products` array directly to <VirtuosoGrid> or <Masonry>.
   * 3. Set the item height or container settings using dynamic measurement hooks.
   * 4. This mapped list structure ensures the swap is a pure layout/rendering
   *    change, requiring zero changes to ProductCard or its properties.
   * =========================================================================
   */

  // Split products array into columns for masonry layout simulation
  // Mobile / Tablet: 2 columns
  const cols2 = [[], []] as Product[][];
  products.forEach((prod, idx) => {
    cols2[idx % 2].push(prod);
  });

  // Desktop: 3 columns
  const cols3 = [[], [], []] as Product[][];
  products.forEach((prod, idx) => {
    cols3[idx % 3].push(prod);
  });

  return (
    <div className="w-full">
      {/* 2-COLUMN VIEW (MOBILE & TABLET - Hidden on Large Desktop) */}
      <div className="grid grid-cols-2 gap-4 lg:hidden">
        {cols2.map((columnProducts, colIdx) => (
          <div key={`col-2-${colIdx}`} className="flex flex-col gap-4">
            {columnProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ))}
      </div>

      {/* 3-COLUMN VIEW (DESKTOP - Hidden on Small Devices) */}
      <div className="hidden lg:grid grid-cols-3 gap-6">
        {cols3.map((columnProducts, colIdx) => (
          <div key={`col-3-${colIdx}`} className="flex flex-col gap-6">
            {columnProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ))}
      </div>

      {/* LOADING STATE - Skeleton Grid matching column layouts */}
      {isLoading && (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-4 lg:hidden">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonCard key={`sk-2-${idx}`} index={idx} />
            ))}
          </div>
          <div className="hidden lg:grid grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={`sk-3-${idx}`} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* INFINITE SCROLL TRIGGER TARGET */}
      {hasMore && !isLoading && (
        <div 
          ref={loadMoreRef} 
          className="w-full h-24 flex items-center justify-center text-foreground/40 text-xs font-semibold uppercase tracking-widest"
        >
          Scrolling for more vibes...
        </div>
      )}

      {/* END OF FEED CALLOUT */}
      {!hasMore && products.length > 0 && (
        <div className="w-full text-center py-16 text-foreground/40 text-xs font-semibold uppercase tracking-widest border-t border-card-border mt-16">
          You've reached the bottom of the loop.
        </div>
      )}

      {/* EMPTY FEED fallback */}
      {!isLoading && products.length === 0 && (
        <div className="w-full text-center py-24 border border-dashed border-card-border rounded-3xl">
          <p className="text-foreground/50 text-sm">No products found matching your vibe.</p>
        </div>
      )}
    </div>
  );
}
