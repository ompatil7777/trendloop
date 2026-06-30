"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProducts, GetProductsParams } from "../../lib/data/products";
import { categories, Category, Product } from "../../lib/mock-data/fixtures";
import ProductCard from "../../components/feed/ProductCard";
import SkeletonCard from "../../components/feed/SkeletonCard";
import { Search, SlidersHorizontal, RotateCcw, ArrowRight } from "lucide-react";
import { analytics } from "../../lib/analytics/trackEvent";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL search query
  const queryParam = searchParams.get("q") || "";
  const priceMaxParam = searchParams.get("priceMax") ? parseInt(searchParams.get("priceMax")!) : undefined;

  // Local Filter States
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [debouncedQuery, setDebouncedQuery] = useState(queryParam);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [selectedSub, setSelectedSub] = useState<string>("");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>(priceMaxParam ? priceMaxParam.toString() : "");
  const [sortBy, setSortBy] = useState<GetProductsParams['sortBy']>("trending");

  // Fetch Results State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Debounce search query input (500ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 450);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync state if URL search params change
  useEffect(() => {
    setSearchQuery(queryParam);
    if (priceMaxParam) {
      setPriceMax(priceMaxParam.toString());
    }
  }, [queryParam, priceMaxParam]);

  // Fetch products handler
  const fetchFilteredProducts = useCallback(async () => {
    setLoading(true);
    
    const params: GetProductsParams = {
      searchQuery: debouncedQuery,
      sortBy,
      limit: 48 // Large enough page for search exploration
    };

    if (selectedCat) params.categorySlug = selectedCat;
    if (selectedSub) params.subcategorySlug = selectedSub;
    if (priceMin) params.priceMin = parseFloat(priceMin);
    if (priceMax) params.priceMax = parseFloat(priceMax);

    try {
      const result = await getProducts(params);
      setProducts(result.products);
      
      // Track search analytics
      if (debouncedQuery) {
        analytics.searchPerformed(debouncedQuery, result.products.length);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedCat, selectedSub, priceMin, priceMax, sortBy]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [fetchFilteredProducts]);

  // Handle category changes (resets subcategory)
  const handleCategorySelect = (catSlug: string) => {
    setSelectedCat(catSlug);
    setSelectedSub("");
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCat("");
    setSelectedSub("");
    setPriceMin("");
    setPriceMax("");
    setSortBy("trending");
    router.replace("/search");
  };

  // Find subcategories for selected parent category
  const activeParent = categories.find(c => c.slug === selectedCat && c.parent_id === null);
  const activeSubs = activeParent 
    ? categories.filter(c => c.parent_id === activeParent.id)
    : [];

  return (
    <div className="space-y-6">
      
      {/* 1. SEARCH BAR */}
      <div className="relative w-full max-w-2xl mx-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search streetwear, mechanical keyboards, room aesthetics..."
          className="w-full pl-12 pr-10 py-4 text-sm rounded-2xl border border-card-border bg-white dark:bg-card text-foreground placeholder-foreground/45 shadow-sm focus:outline-none focus:border-gold transition-all"
        />
        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-foreground/40 hover:text-foreground uppercase tracking-wider"
          >
            clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        
        {/* 2. FILTERS SIDEBAR (Desktop) */}
        <aside className={`lg:col-span-3 space-y-6 bg-card border border-card-border p-5 rounded-2xl md:rounded-3xl ${
          showFiltersMobile ? "block" : "hidden lg:block"
        }`}>
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-foreground/80 flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter Catalog
            </h2>
            <button
              onClick={resetFilters}
              className="text-[9px] font-bold text-gold hover:text-gold-hover uppercase tracking-widest flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Categories Selector */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground/45">Category</h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleCategorySelect("")}
                className={`text-xs font-semibold px-2 py-1.5 rounded-lg text-left transition-colors ${
                  !selectedCat 
                    ? "bg-gold-light text-gold" 
                    : "text-foreground/75 hover:bg-gray-100 dark:hover:bg-gray-100/10"
                }`}
              >
                All Categories
              </button>
              {categories.filter(c => c.parent_id === null).map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`text-xs font-semibold px-2 py-1.5 rounded-lg text-left transition-colors ${
                    selectedCat === cat.slug 
                      ? "bg-gold-light text-gold" 
                      : "text-foreground/75 hover:bg-gray-100 dark:hover:bg-gray-100/10"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories (Visible only if parent category is selected) */}
          {selectedCat && activeSubs.length > 0 && (
            <div className="space-y-2 animate-slide-up">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground/45">Subcategory</h3>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSub("")}
                  className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1.5 rounded-full border transition-colors ${
                    !selectedSub 
                      ? "border-gold bg-gold text-white" 
                      : "border-card-border text-foreground hover:bg-gray-100 dark:hover:bg-gray-100/10"
                  }`}
                >
                  All
                </button>
                {activeSubs.map((sub) => (
                  <button
                    key={sub.slug}
                    onClick={() => setSelectedSub(sub.slug)}
                    className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1.5 rounded-full border transition-colors ${
                      selectedSub === sub.slug 
                        ? "border-gold bg-gold text-white" 
                        : "border-card-border text-foreground hover:bg-gray-100 dark:hover:bg-gray-100/10"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground/45">Price Range</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min (₹)"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
              />
              <span className="text-foreground/40 text-xs">-</span>
              <input
                type="number"
                placeholder="Max (₹)"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Sort Filter */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground/45">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
            >
              <option value="trending">Trending Vibe</option>
              <option value="newest">Recently Added</option>
              <option value="popular">Popular Saves</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* MOBILE FILTER TOGGLE BUTTON */}
        <div className="lg:hidden flex items-center justify-between gap-4 pt-2">
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="flex items-center justify-center gap-2 px-5 py-3 border border-card-border rounded-xl bg-card text-foreground font-bold text-xs uppercase tracking-wider hover:bg-gray-100"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFiltersMobile ? "Hide Filters" : "Show Filters"}
          </button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-3 border border-card-border rounded-xl bg-card text-xs font-bold uppercase tracking-wide text-foreground focus:outline-none"
          >
            <option value="trending">Trending</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* 3. PRODUCTS GRID DISPLAY */}
        <main className="lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/45">
              Showing {products.length} Results
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <SkeletonCard key={`search-sk-${idx}`} index={idx} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map((prod) => (
                <ProductCard key={`search-${prod.id}`} product={prod} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-card-border rounded-3xl space-y-4">
              <p className="text-sm text-foreground/50 font-medium">
                No items fit this aesthetic query.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-gold hover:underline text-xs font-bold uppercase tracking-wider"
              >
                Reset Search Filters
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
