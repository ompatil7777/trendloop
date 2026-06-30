"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Product } from "../../lib/mock-data/fixtures";
import ProductCard from "./ProductCard";

interface TrendThemeRailProps {
  title: string;
  subtitle: string;
  badgeText: string;
  themeSlug: string;
  trendTag: string;
  products: Product[];
}

export default function TrendThemeRail({
  title,
  subtitle,
  badgeText,
  themeSlug,
  trendTag,
  products
}: TrendThemeRailProps) {
  if (!products || products.length === 0) return null;

  // Limit to exactly 5-6 products to maintain premium curation and avoid choice fatigue
  const curatedProducts = products.slice(0, 6);

  return (
    <section className="space-y-6">
      {/* 1. Theme Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-card-border pb-4 gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground font-display">
              {title}
            </h2>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold/10 text-gold text-[9px] font-bold uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{badgeText}</span>
            </div>
          </div>
          <p className="text-xs text-foreground/50 leading-relaxed font-sans">
            {subtitle}
          </p>
        </div>
        <Link
          href={`/trends/${themeSlug}`}
          className="text-xs font-bold text-gold hover:text-gold-hover transition-colors flex items-center gap-1 uppercase tracking-wider self-start md:self-end flex-shrink-0"
        >
          See all {title.replace(/\s*🍬\s*|\s*🏺\s*|\s*🧶\s*/g, "")} finds
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 2. Curated Product Row (Horizontally scrollable) */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar fade-mask">
        {curatedProducts.map((product) => (
          <div key={`trend-theme-${themeSlug}-${product.id}`} className="flex-shrink-0 w-64 md:w-72">
            <ProductCard 
              product={product} 
              trendTag={trendTag}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
