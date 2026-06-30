import { notFound } from "next/navigation";
import { getCategoryBySlug, getSubcategories } from "../../../../lib/data/categories";
import { getProducts } from "../../../../lib/data/products";
import DiscoverClient from "../../../discover/discover-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface SubcategoryPageProps {
  params: Promise<{ category: string; sub: string }>;
}

export async function generateMetadata({ params }: SubcategoryPageProps) {
  const { category, sub } = await params;
  const [parentCat, subCat] = await Promise.all([
    getCategoryBySlug(category),
    getCategoryBySlug(sub)
  ]);

  if (!parentCat || !subCat) {
    return { title: "Category Not Found — Trendloop" };
  }

  return {
    title: `${subCat.name} in ${parentCat.name} — Trendloop`,
    description: subCat.description,
  };
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { category, sub } = await params;
  const [parentCat, subCat] = await Promise.all([
    getCategoryBySlug(category),
    getCategoryBySlug(sub)
  ]);

  if (!parentCat || !subCat || subCat.parent_id !== parentCat.id) {
    notFound();
  }

  // Fetch all sibling subcategories for the pill rail navigation
  const subs = await getSubcategories(category);

  // Fetch initial products matching subcategory
  const { products: initialProducts, totalCount } = await getProducts({
    categorySlug: category,
    subcategorySlug: sub,
    sortBy: "trending",
    limit: 12,
    offset: 0
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button & Title */}
      <div className="space-y-4 border-b border-card-border pb-6">
        <Link
          href={`/category/${category}`}
          className="inline-flex items-center gap-1.5 text-foreground/45 hover:text-foreground text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {parentCat.name}
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gold uppercase tracking-widest">
              {parentCat.name} / {subCat.name}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-foreground font-display leading-none">
              {subCat.name}
            </h1>
            <p className="text-xs sm:text-sm text-foreground/50 max-w-xl leading-relaxed">
              {subCat.description || parentCat.description}
            </p>
          </div>
          
          <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest border border-card-border px-3 py-1.5 rounded-full self-start md:self-end">
            {totalCount} items in subcategory
          </span>
        </div>
      </div>

      {/* Subcategory Pill Rail */}
      {subs.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar fade-mask">
          <Link
            href={`/category/${category}`}
            className="flex-shrink-0 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-card-border text-foreground hover:bg-gray-100 dark:hover:bg-gray-100/10 transition-colors"
          >
            All {parentCat.name}
          </Link>
          {subs.map((s) => {
            const isCurrentSub = s.slug === sub;
            return (
              <Link
                key={s.slug}
                href={`/category/${category}/${s.slug}`}
                className={`flex-shrink-0 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border transition-colors ${
                  isCurrentSub
                    ? "border-gold bg-gold text-white"
                    : "border-card-border text-foreground hover:bg-gray-100 dark:hover:bg-gray-100/10"
                }`}
              >
                {s.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* Grid of products */}
      <div className="pt-4">
        <DiscoverClient 
          initialProducts={initialProducts} 
          initialTotal={totalCount} 
          categorySlug={category}
          subcategorySlug={sub}
        />
      </div>

    </div>
  );
}
