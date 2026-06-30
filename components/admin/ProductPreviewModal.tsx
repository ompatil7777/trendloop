"use client";

import { X, Sparkles, AlertCircle, ShoppingBag, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useApp } from "../../lib/context/AppContext";
import Gallery from "../product/Gallery";
import ProsConsBlock from "../product/ProsConsBlock";

interface ProductPreviewModalProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    brand: string;
    images: { url: string; alt: string; order: number }[];
    features: string[];
    pros: string[];
    cons: string[];
    is_trending: boolean;
  };
  affiliateUrl: string;
  retailer: "amazon" | "flipkart" | "myntra" | "nike" | "keychron";
  onClose: () => void;
}

export default function ProductPreviewModal({ product, affiliateUrl, retailer, onClose }: ProductPreviewModalProps) {
  const { formatPrice } = useApp();

  const getRetailerLabel = (ret: string) => {
    switch (ret) {
      case "amazon": return "Buy at Amazon";
      case "flipkart": return "Buy at Flipkart";
      case "myntra": return "Buy at Myntra";
      case "nike": return "Shop on Nike";
      case "keychron": return "Shop on Keychron";
      default: return `Shop on ${ret.toUpperCase()}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-background border border-card-border rounded-3xl w-full max-w-5xl my-8 overflow-hidden shadow-2xl relative text-foreground animate-scale-in">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-20 glass-effect border-b border-card-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-gold-light text-gold text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-gold/25">
              Live Preview Mode
            </span>
            <span className="text-xs text-foreground/45">How visitors will see this product page</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-gray-150 dark:hover:bg-zinc-800 text-foreground transition-colors"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Page Replica Layout */}
        <div className="p-6 sm:p-10 max-h-[80vh] overflow-y-auto space-y-12">
          
          {/* Main product display grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
            
            {/* Left Column: Image gallery */}
            <div className="md:col-span-6 w-full">
              {product.images && product.images.length > 0 ? (
                <Gallery images={product.images} />
              ) : (
                <div className="aspect-square bg-gray-50 dark:bg-zinc-950 border border-card-border rounded-2xl flex items-center justify-center text-foreground/40 text-xs">
                  No preview images generated
                </div>
              )}
            </div>
            
            {/* Right Column: Interaction details & checkout links */}
            <div className="md:col-span-6 w-full space-y-6">
              
              {/* Brand & title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                    {product.brand}
                  </span>
                  {product.is_trending && (
                    <span className="bg-gold-light text-gold text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      Trending Vibe
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-foreground leading-tight font-display">
                  {product.name}
                </h1>
              </div>

              {/* Price display */}
              <div className="border-y border-card-border py-4 flex items-baseline gap-3">
                <span className="text-3xl font-black text-foreground">
                  {formatPrice(product.price)}
                </span>
                <span className="text-[10px] text-foreground/40 font-medium">
                  Price at retailer, may vary
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed font-sans">
                {product.description}
              </p>

              {/* Feature Specifications List */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                    Product Specifications
                  </h3>
                  <ul className="grid grid-cols-1 gap-1.5 text-xs text-foreground/75 leading-relaxed font-sans list-disc list-inside">
                    {product.features.map((feat, index) => (
                      <li key={`feat-${index}`} className="marker:text-gold">
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Outbound Link Button */}
              <div className="space-y-3 pt-6 border-t border-card-border">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-foreground/40">
                  <AlertCircle className="w-3.5 h-3.5 text-gold" />
                  <span>Affiliate Outbound Links</span>
                </div>
                
                {affiliateUrl ? (
                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between gap-3 px-6 py-4 rounded-xl bg-foreground text-background hover:bg-gold hover:text-white dark:bg-foreground dark:text-background dark:hover:bg-gold dark:hover:text-white transition-all duration-300 shadow-md font-sans text-sm font-bold tracking-wider uppercase group"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 group-hover:scale-105 transition-transform" />
                      {getRetailerLabel(retailer)}
                    </span>
                    <span className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] lowercase font-normal italic tracking-normal">test link</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </a>
                ) : (
                  <div className="bg-red-500/10 text-red-500 rounded-xl p-3 border border-red-500/25 flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>No affiliate link set yet. Outbound button is disabled for public users.</span>
                  </div>
                )}
                
                {/* FTC Disclosure */}
                <p className="text-[10px] text-foreground/35 leading-relaxed italic text-center pt-2">
                  As an affiliate discovery platform, we may earn a commission when you purchase through these outbound redirects.
                </p>
              </div>

            </div>
          </div>

          {/* Editorial Verdict: Pros & Cons Block */}
          <div className="border-t border-card-border pt-8 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/40">
                Editorial Review Verdict
              </h3>
              <p className="text-xs text-foreground/50">
                Based on curated reviews from style forums and setups communities.
              </p>
            </div>
            <ProsConsBlock 
              pros={product.pros && product.pros.length > 0 ? product.pros : ["Ground truth quality materials", "Gen-Z aesthetic fit"]} 
              cons={product.cons && product.cons.length > 0 ? product.cons : ["Requires import delivery times"]} 
            />
          </div>

        </div>
      </div>
    </div>
  );
}
