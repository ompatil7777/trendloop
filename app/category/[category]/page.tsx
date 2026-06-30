import { notFound } from "next/navigation";
import { getCategoryBySlug, getSubcategories } from "../../../lib/data/categories";
import { getProducts } from "../../../lib/data/products";
import DiscoverClient from "../../discover/discover-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "Category Not Found — Trendloop" };

  return {
    title: `${cat.name} Aesthetics — Trendloop`,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);

  if (!cat) {
    notFound();
  }

  // Fetch subcategories
  const subs = await getSubcategories(category);

  // Fetch initial products
  const { products: initialProducts, totalCount } = await getProducts({
    categorySlug: category,
    sortBy: "trending",
    limit: 12,
    offset: 0
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button & Title */}
      <div className="space-y-4 border-b border-card-border pb-6">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-foreground/45 hover:text-foreground text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Discover
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-foreground font-display leading-none">
              {cat.name}
            </h1>
            <p className="text-xs sm:text-sm text-foreground/50 max-w-xl leading-relaxed">
              {cat.description}
            </p>
          </div>
          
          <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest border border-card-border px-3 py-1.5 rounded-full self-start md:self-end">
            {totalCount} items in category
          </span>
        </div>
      </div>

      {/* Subcategory Pill Rail */}
      {subs.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar fade-mask">
          <Link
            href={`/category/${category}`}
            className="flex-shrink-0 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-gold bg-gold text-white"
          >
            All {cat.name}
          </Link>
          {subs.map((sub) => (
            <Link
              key={sub.slug}
              href={`/category/${category}/${sub.slug}`}
              className="flex-shrink-0 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-card-border text-foreground hover:bg-gray-100 dark:hover:bg-gray-100/10 transition-colors"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {/* Grid of products (reuses discover infinite scroll client, passing correct params) */}
      <div className="pt-4">
        <DiscoverClient 
          initialProducts={initialProducts} 
          initialTotal={totalCount} 
          categorySlug={category}
        />
      </div>

    </div>
  );
}
