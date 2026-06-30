import { notFound } from "next/navigation";
import { collections, products } from "../../../lib/mock-data/fixtures";
import ProductCard from "../../../components/feed/ProductCard";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const col = collections.find(c => c.slug === slug);
  if (!col) return { title: "Collection Not Found — Trendloop" };

  return {
    title: `${col.name} — Trendloop Curated Collection`,
    description: col.description,
  };
}

export default async function SingleCollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const col = collections.find(c => c.slug === slug);

  if (!col) {
    notFound();
  }

  // Fetch products inside this collection
  const matchingProducts = products.filter((p) => col.product_ids.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Link */}
      <Link
        href="/collections"
        className="inline-flex items-center gap-1.5 text-foreground/45 hover:text-foreground text-xs font-bold uppercase tracking-widest transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Collections
      </Link>

      {/* Collection Header */}
      <div className="relative rounded-3xl overflow-hidden min-h-[300px] flex items-end border border-card-border shadow-sm">
        <img
          src={col.cover_image}
          alt={col.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        
        <div className="relative z-10 p-6 sm:p-10 text-white space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1 bg-gold/90 text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span>Curator Handpicked</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase font-display leading-tight">
            {col.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-200/90 leading-relaxed font-sans">
            {col.description}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        <div className="border-b border-card-border pb-3 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-foreground/50">
            Collection Products ({matchingProducts.length})
          </h2>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {matchingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

    </div>
  );
}
