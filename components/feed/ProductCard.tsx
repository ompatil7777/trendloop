"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, MouseEvent } from "react";
import { useApp } from "../../lib/context/AppContext";
import { Product } from "../../lib/mock-data/fixtures";
import { Heart, Share2, ArrowUpRight } from "lucide-react";
import { analytics } from "../../lib/analytics/trackEvent";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  trendTag?: string;
}

export default function ProductCard({ product, priority = false, trendTag }: ProductCardProps) {
  const { isSaved, toggleSaveProduct, formatPrice, addToast } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const saved = isSaved(product.id);

  // Variable heights based on product ID to simulate high-fidelity masonry grids
  const getAspectRatioClass = (id: string) => {
    const num = parseInt(id.replace(/\D/g, "")) || 0;
    const remainder = num % 3;
    if (remainder === 0) return "aspect-[3/4]";     // Portrait (tall)
    if (remainder === 1) return "aspect-[4/5]";     // Standard portrait
    return "aspect-square";                         // Square
  };

  const handleSave = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveProduct(product.id);
  };

  const handleShare = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productUrl = `${window.location.origin}/product/${product.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: productUrl,
        });
        analytics.productShared(product, "native");
      } else {
        await navigator.clipboard.writeText(productUrl);
        addToast("Link copied to clipboard!", "success");
        analytics.productShared(product, "copy_link");
      }
    } catch (err) {
      console.error("Error sharing product:", err);
    }
  };

  const primaryImage = product.images[0]?.url || "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block relative w-full overflow-hidden bg-card border border-card-border rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IMAGE CONTAINER */}
      <div className={`relative w-full overflow-hidden ${getAspectRatioClass(product.id)} bg-gray-50 dark:bg-gray-900`}>
        <img
          src={primaryImage}
          alt={product.images[0]?.alt || product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading={priority ? "eager" : "lazy"}
        />

        {/* OVERLAYS */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
          {/* Top Actions */}
          <div className="flex justify-end gap-2 self-end">
            <button
              onClick={handleShare}
              className="p-2 rounded-full glass-effect border border-white/10 text-white hover:bg-white hover:text-black transition-colors shadow-sm"
              title="Share Link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSave}
              className={`p-2 rounded-full glass-effect border border-white/10 shadow-sm transition-colors ${
                saved 
                  ? "bg-gold border-gold text-white" 
                  : "text-white hover:bg-white hover:text-black"
              }`}
              title={saved ? "Saved" : "Save Item"}
            >
              <Heart className={`w-3.5 h-3.5 ${saved ? "fill-white" : ""}`} />
            </button>
          </div>

          {/* Bottom Callout */}
          <div className="flex items-center gap-1 text-[10px] font-bold text-white uppercase tracking-widest bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full self-start">
            <span>View Details</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* MOBILE INSTANT SAVE ICON (visible on mobile, hidden on desktop hover overlay) */}
        <button
          onClick={handleSave}
          className={`lg:hidden absolute top-2 right-2 p-2 rounded-full bg-white/70 dark:bg-black/60 backdrop-blur-sm shadow-sm transition-colors ${
            saved ? "text-gold" : "text-foreground/70"
          }`}
          aria-label="Save product"
        >
          <Heart className={`w-3.5 h-3.5 ${saved ? "fill-gold text-gold" : ""}`} />
        </button>
      </div>

      {/* TEXT DETAILS */}
      <div className="p-3.5">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[9px] font-bold tracking-widest text-foreground/40 uppercase">
            {product.brand}
          </span>
          {trendTag ? (
            <span className="bg-gold/10 text-gold dark:text-gold text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
              {trendTag}
            </span>
          ) : product.is_trending && (
            <span className="bg-gold-light text-gold dark:text-gold text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
              Trending
            </span>
          )}
        </div>
        <h3 className="text-xs font-semibold text-foreground leading-tight line-clamp-2 min-h-[2rem]">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          <span className="text-[10px] text-foreground/50 font-medium">
            {product.brand === "Keychron" || product.brand === "BANDAI" ? "Buy Official" : "Buy Now"}
          </span>
        </div>
      </div>
    </Link>
  );
}
