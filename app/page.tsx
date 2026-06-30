import Link from "next/link";
import { getFeaturedProducts, getTrendingProducts, getProductsUnderPrice, getProducts } from "../lib/data/products";
import { getCategories } from "../lib/data/categories";
import { getGuides } from "../lib/data/guides";
import ProductCard from "../components/feed/ProductCard";
import RelatedRail from "../components/product/RelatedRail";
import NewsletterCapture from "./newsletter-capture";
import { ArrowRight, Sparkles, Flame, Eye, Bookmark, TrendingUp } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Fetch data in parallel for fast loading
  const [
    featuredProducts,
    trendingProducts,
    budgetProducts,
    categories,
    guides,
    recentResult
  ] = await Promise.all([
    getFeaturedProducts(3),
    getTrendingProducts(8),
    getProductsUnderPrice(1500, 8),
    getCategories(),
    getGuides(),
    getProducts({ sortBy: 'newest', limit: 8 })
  ]);

  const recentProducts = recentResult.products;

  // Simulate "Hidden Gems" - Products with high save-to-view ratio
  const hiddenGemsResult = await getProducts({ sortBy: 'popular', limit: 12 });
  const hiddenGems = hiddenGemsResult.products
    .filter(p => !p.is_featured && p.save_count > 20)
    .slice(0, 4);

  // Focus Hero Product (First featured item)
  const heroProduct = featuredProducts[0] || recentProducts[0];
  const heroImage = heroProduct?.images[0]?.url || "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* 1. HERO SHOWCASE SECTION */}
      {heroProduct && (
        <section className="relative w-full rounded-3xl overflow-hidden min-h-[500px] flex items-end border border-card-border shadow-lg">
          <img
            src={heroImage}
            alt={heroProduct.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Obsidian Gradient Layer */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
          
          {/* Hero Content Card */}
          <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-2xl text-white space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-white">
              <Sparkles className="w-3 h-3" />
              <span>Standout Trend</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display leading-tight text-white uppercase">
              {heroProduct.name}
            </h1>
            
            <p className="text-sm text-gray-200/90 leading-relaxed font-sans line-clamp-3">
              {heroProduct.description}
            </p>
            
            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <Link
                href={`/product/${heroProduct.slug}`}
                className="inline-flex items-center gap-2 bg-white text-black hover:bg-gold hover:text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Discover Vibe
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="text-sm font-semibold text-gray-300">
                by <span className="text-white font-bold">{heroProduct.brand}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. TRENDING NOW SECTION (Horizontally scrollable) */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-card-border pb-3">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <Flame className="w-5 h-5 text-gold" />
            Trending Now
          </h2>
          <Link
            href="/trending"
            className="text-xs font-bold text-gold hover:text-gold-hover transition-colors flex items-center gap-1 uppercase tracking-wider"
          >
            See All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        
        {/* Horizontal scroll list */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar fade-mask">
          {trendingProducts.map((product) => (
            <div key={`trend-${product.id}`} className="flex-shrink-0 w-64 md:w-72">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* 3. EDITOR'S PICKS GRID */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-card-border pb-3">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-foreground/70" />
            Editor's Picks
          </h2>
          <span className="text-xs text-foreground/40 font-semibold uppercase tracking-wider">
            Curated Taste
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard key={`featured-${product.id}`} product={product} />
          ))}
        </div>
      </section>

      {/* 4. BUDGET DISCOVERY: UNDER ₹1,500 (Config value) */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-card-border pb-3">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-foreground/70" />
            Luxury on a Budget
          </h2>
          <Link
            href="/search?priceMax=1500"
            className="text-xs font-bold text-gold hover:text-gold-hover transition-colors flex items-center gap-1 uppercase tracking-wider"
          >
            Under ₹1500 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar fade-mask">
          {budgetProducts.map((product) => (
            <div key={`budget-${product.id}`} className="flex-shrink-0 w-64 md:w-72">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* 5. DYNAMIC CATEGORY BLOCKS RAIL */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-card-border pb-3">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
            Explore Aesthetics
          </h2>
          <span className="text-xs text-foreground/40 font-semibold uppercase tracking-wider">
            Select Your Vibe
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => {
            // Unique aesthetic colors for blocks
            const bgClasses = [
              "bg-[#f3f0ea] dark:bg-[#1a1815]", // Stone warm
              "bg-[#eceff4] dark:bg-[#15171a]", // Soft slate
              "bg-[#f4ecf0] dark:bg-[#1b1517]", // Rose dust
              "bg-[#ebf4f0] dark:bg-[#151b17]", // Sage green
              "bg-[#f0edf5] dark:bg-[#17151b]"  // Heather purple
            ];
            
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`group p-6 rounded-2xl border border-card-border hover:shadow-md transition-all duration-300 ${bgClasses[idx % bgClasses.length]}`}
              >
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground group-hover:text-gold transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-foreground/50 leading-relaxed line-clamp-3">
                    {cat.description}
                  </p>
                  <div className="text-[10px] font-bold text-gold uppercase tracking-widest inline-flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    <span>Enter</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. HIDDEN GEMS (Surfaces gems based on high save ratio) */}
      {hiddenGems.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-card-border pb-3">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gold" />
              Hidden Gems
            </h2>
            <span className="text-xs text-foreground/40 font-semibold uppercase tracking-wider">
              Highly Saved, Low Profile
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {hiddenGems.map((product) => (
              <ProductCard key={`gem-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 7. SEO RECENT BUYING GUIDES HUB */}
      {guides.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-card-border pb-3">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
              Trend Handbooks & Guides
            </h2>
            <Link
              href="/guides"
              className="text-xs font-bold text-gold hover:text-gold-hover transition-colors flex items-center gap-1 uppercase tracking-wider"
            >
              All Articles <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {guides.slice(0, 2).map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.slug}`}
                className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-card-border hover:shadow-lg bg-card transition-all duration-300"
              >
                <div className="w-full sm:w-40 aspect-video sm:aspect-square overflow-hidden rounded-xl bg-gray-100 flex-shrink-0">
                  <img
                    src={guide.cover_image}
                    alt={guide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-col justify-between py-1 gap-2">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-gold uppercase tracking-widest">
                      Buying Guide
                    </span>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-gold transition-colors leading-snug line-clamp-2">
                      {guide.title}
                    </h3>
                    <p className="text-[11px] text-foreground/50 leading-relaxed line-clamp-2">
                      {guide.seo_description}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/45">
                    {new Date(guide.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 8. NEWSLETTER INTERACTIVE CARD CAPTURE */}
      <NewsletterCapture />

    </div>
  );
}
