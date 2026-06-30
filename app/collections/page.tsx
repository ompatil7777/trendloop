import Link from "next/link";
import { collections } from "../../lib/mock-data/fixtures";
import { Sparkles, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Curated Thematic Collections — Trendloop",
  description: "Explore designer-curated collections of streetwear, gaming desk setups, anime bedrooms, and gym wear trends.",
};

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="space-y-2 border-b border-card-border pb-5">
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground font-display flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-gold" />
          Curated Collections
        </h1>
        <p className="text-xs sm:text-sm text-foreground/50 max-w-md leading-relaxed">
          Thematic selections compiled by our design coordinators.
        </p>
      </div>

      {/* Grid of collections */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((col) => (
          <Link
            key={col.id}
            href={`/collections/${col.slug}`}
            className="group flex flex-col bg-card border border-card-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* Cover Image */}
            <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100 relative">
              <img
                src={col.cover_image}
                alt={col.name}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />
              <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                {col.product_ids.length} products
              </span>
            </div>
            
            {/* Content Details */}
            <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <h2 className="text-sm font-bold text-foreground group-hover:text-gold transition-colors leading-snug uppercase">
                  {col.name}
                </h2>
                <p className="text-xs text-foreground/50 leading-relaxed line-clamp-2">
                  {col.description}
                </p>
              </div>
              
              <div className="text-[10px] font-bold text-gold uppercase tracking-widest inline-flex items-center gap-1.5 pt-2 border-t border-card-border w-full">
                <span>View collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
