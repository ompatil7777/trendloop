"use client";

import { useState } from "react";
import MasonryGrid from "../../components/feed/MasonryGrid";
import { Product } from "../../lib/mock-data/fixtures";
import { getProducts } from "../../lib/data/products";

interface DiscoverClientProps {
  initialProducts: Product[];
  initialTotal: number;
  categorySlug?: string;
  subcategorySlug?: string;
}

export default function DiscoverClient({ 
  initialProducts, 
  initialTotal,
  categorySlug,
  subcategorySlug
}: DiscoverClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [offset, setOffset] = useState(initialProducts.length);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(products.length < initialTotal);

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const limit = 12;
      const result = await getProducts({
        sortBy: "trending",
        limit,
        offset,
        categorySlug,
        subcategorySlug
      });

      if (result.products.length > 0) {
        setProducts((prev) => [...prev, ...result.products]);
        setOffset((prev) => prev + result.products.length);
        setHasMore(offset + result.products.length < result.totalCount);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MasonryGrid
      products={products}
      isLoading={loading}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
    />
  );
}
