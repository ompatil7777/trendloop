"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useCallback } from "react";
import { createClient } from "../../lib/supabase/client";
import { useApp } from "../../lib/context/AppContext";
import { 
  ShoppingBag, 
  MousePointer, 
  FolderHeart, 
  DollarSign, 
  ArrowUpRight, 
  Check, 
  AlertCircle,
  Plus,
  ShieldAlert,
  Loader2
} from "lucide-react";
import ScoutPanel from "../../components/admin/ScoutPanel";
import DraftQueuePanel from "../../components/admin/DraftQueuePanel";
import ScoutAnalyticsPanel from "../../components/admin/ScoutAnalyticsPanel";

const supabase = createClient();

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px] text-foreground/50 text-xs font-semibold uppercase tracking-widest">
        <Loader2 className="w-5 h-5 animate-spin text-gold mr-2" />
        Loading Admin Board...
      </div>
    }>
      <AdminContent />
    </Suspense>
  );
}

function AdminContent() {
  const searchParams = useSearchParams();
  const action = searchParams.get("action") || "dashboard";
  const { user, addToast, showAuthModal, setShowAuthModal } = useApp();

  // Admin Access Gate
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Stats State
  const [productsCount, setProductsCount] = useState(0);
  const [clicksCount, setClicksCount] = useState(0);
  const [savesCount, setSavesCount] = useState(0);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [retailerShares, setRetailerShares] = useState<any[]>([]);
  const [trendShares, setTrendShares] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Form State
  const [newProductName, setNewProductName] = useState("");
  const [newProductBrand, setNewProductBrand] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCat, setNewProductCat] = useState("");
  const [newProductSub, setNewProductSub] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [newProductPros, setNewProductPros] = useState("");
  const [newProductCons, setNewProductCons] = useState("");
  const [amazonUrl, setAmazonUrl] = useState("");
  const [nikeUrl, setNikeUrl] = useState("");
  const [selectedTrends, setSelectedTrends] = useState<string[]>([]);

  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  
  // Links Manager State
  const [linksList, setLinksList] = useState<any[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);

  // Guides Manager State
  const [guidesList, setGuidesList] = useState<any[]>([]);

  // Verify Role Check
  useEffect(() => {
    async function checkRole() {
      setCheckingAuth(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAdmin(false);
        setCheckingAuth(false);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      setIsAdmin(profile?.role === "admin");
      setCheckingAuth(false);
    }
    checkRole();
  }, [user]);

  // Load Dashboard Data
  const loadDashboardStats = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingStats(true);
    try {
      // 1. Fetch counts
      const { count: prodCount } = await supabase.from("products").select("id", { count: "exact", head: true });
      
      const { data: sumData } = await supabase
        .from("products")
        .select("click_count, save_count");

      const totalClicks = (sumData || []).reduce((acc, curr) => acc + Number(curr.click_count || 0), 0);
      const totalSaves = (sumData || []).reduce((acc, curr) => acc + Number(curr.save_count || 0), 0);

      setProductsCount(prodCount || 0);
      setClicksCount(totalClicks);
      setSavesCount(totalSaves);

      // 2. Fetch top products
      const { data: topProds } = await supabase
        .from("products")
        .select("id, name, brand, click_count, save_count")
        .order("click_count", { ascending: false })
        .limit(5);

      setTopProducts(topProds || []);

      // 3. Click Shares by Retailer
      const { data: clicks } = await supabase
        .from("click_events")
        .select("affiliate_link_id, affiliate_links(retailer)");

      const retailerCounts: Record<string, number> = {};
      let totalEvents = 0;
      (clicks || []).forEach((c: any) => {
        const retName = c.affiliate_links?.retailer || "other";
        retailerCounts[retName] = (retailerCounts[retName] || 0) + 1;
        totalEvents++;
      });

      const shares = Object.entries(retailerCounts).map(([name, count]) => ({
        name: name.toUpperCase(),
        count,
        share: totalEvents > 0 ? count / totalEvents : 0
      })).sort((a, b) => b.count - a.count);

      setRetailerShares(shares);

      // 4. Click Shares by Trend Theme (based on utm_source = trend_*)
      const { data: trendClicks } = await supabase
        .from("click_events")
        .select("utm_source")
        .like("utm_source", "trend_%");

      const trendCounts: Record<string, number> = {};
      let totalTrendEvents = 0;
      (trendClicks || []).forEach((c: any) => {
        const rawSource = c.utm_source || "other";
        let displayName = rawSource.replace("trend_", "");
        if (displayName === "gimme-gummy" || displayName === "gummy") displayName = "Gimme Gummy 🍬";
        else if (displayName === "afrohemian-decor" || displayName === "afrohemian") displayName = "Afrohemian Decor 🏺";
        else if (displayName === "doily-era" || displayName === "doily") displayName = "Doily Era 🧶";
        else displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        
        trendCounts[displayName] = (trendCounts[displayName] || 0) + 1;
        totalTrendEvents++;
      });

      const trendShareList = Object.entries(trendCounts).map(([name, count]) => ({
        name,
        count,
        share: totalTrendEvents > 0 ? count / totalTrendEvents : 0
      })).sort((a, b) => b.count - a.count);

      setTrendShares(trendShareList);

    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, [isAdmin]);

  // Load Categories list for dropdown selection
  useEffect(() => {
    if (!isAdmin) return;
    async function loadCategories() {
      const { data } = await supabase.from("categories").select("*");
      setCategoriesList(data || []);
      if (data && data.length > 0) {
        setNewProductCat(data.find((c: any) => c.parent_id === null)?.id || "");
        setNewProductSub(data.find((c: any) => c.parent_id !== null)?.id || "");
      }
    }
    loadCategories();
  }, [isAdmin]);

  // Load Links Manager Table
  const loadLinksManager = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingLinks(true);
    const { data } = await supabase
      .from("affiliate_links")
      .select("*, products(name, brand)");
    setLinksList(data || []);
    setLoadingLinks(false);
  }, [isAdmin]);

  // Load Guides list
  const loadGuidesList = useCallback(async () => {
    if (!isAdmin) return;
    const { data } = await supabase.from("guides").select("id, title, slug, seo_description");
    setGuidesList(data || []);
  }, [isAdmin]);

  useEffect(() => {
    if (action === "dashboard") loadDashboardStats();
    if (action === "links") loadLinksManager();
    if (action === "guides") loadGuidesList();
  }, [action, loadDashboardStats, loadLinksManager, loadGuidesList]);

  // Toggle Affiliate Link Active State
  const toggleLinkActive = async (linkId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("affiliate_links")
      .update({ is_active: !currentStatus })
      .eq("id", linkId);

    if (error) {
      addToast("Failed to update link status", "error");
    } else {
      addToast("Link status updated", "success");
      loadLinksManager();
    }
  };

  // Submit product creation to Supabase
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductBrand.trim() || !newProductPrice.trim() || !newProductCat) {
      addToast("Please fill in all required fields.", "error");
      return;
    }

    const price = parseInt(newProductPrice);
    const slug = newProductName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newProd = {
      slug,
      name: newProductName,
      brand: newProductBrand,
      price,
      category_id: newProductCat,
      subcategory_id: newProductSub || null,
      description: newProductDesc,
      features: ["Premium Quality", "Durable materials"],
      pros: newProductPros.split(",").map(p => p.trim()).filter(Boolean),
      cons: newProductCons.split(",").map(p => p.trim()).filter(Boolean),
      trend_theme: selectedTrends,
      images: [{
        url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
        alt: newProductName,
        order: 0
      }]
    };

    // 1. Insert product
    const { data: prod, error: prodErr } = await supabase
      .from("products")
      .insert(newProd)
      .select()
      .single();

    if (prodErr) {
      addToast(prodErr.message, "error");
      return;
    }

    // 2. Insert Affiliate Outbound Links
    const linksToInsert = [];
    if (amazonUrl.trim()) {
      linksToInsert.push({
        product_id: prod.id,
        retailer: "amazon",
        raw_url: amazonUrl.trim()
      });
    }
    if (nikeUrl.trim()) {
      linksToInsert.push({
        product_id: prod.id,
        retailer: "nike",
        raw_url: nikeUrl.trim()
      });
    }

    if (linksToInsert.length > 0) {
      const { error: linksErr } = await supabase
        .from("affiliate_links")
        .insert(linksToInsert);

      if (linksErr) {
        addToast("Product added, but affiliate links setup failed.", "error");
      }
    }

    addToast(`Successfully created ${newProductName}!`, "success");
    
    // Reset Form
    setNewProductName("");
    setNewProductBrand("");
    setNewProductPrice("");
    setNewProductDesc("");
    setNewProductPros("");
    setNewProductCons("");
    setAmazonUrl("");
    setNikeUrl("");
    setSelectedTrends([]);
  };

  // Role authentication fallback view
  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-foreground/50 text-xs font-semibold uppercase tracking-widest">
        <Loader2 className="w-5 h-5 animate-spin text-gold" />
        Authenticating role permissions...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md py-16 text-center space-y-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/20 text-red-500 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground font-display">
            Access Restricted
          </h2>
          <p className="text-xs text-foreground/50 leading-relaxed font-sans">
            Admin role credentials are required to view dashboard metrics and edit product catalogs.
          </p>
        </div>

        {!user ? (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-3 rounded-xl bg-foreground text-background hover:bg-gold hover:text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
          >
            Login as Admin
          </button>
        ) : (
          <div className="p-4 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-900 text-left text-xs space-y-3 leading-relaxed">
            <p className="font-bold text-foreground">To elevate your account to Admin role:</p>
            <p className="text-foreground/60">
              Run this SQL update statement in your <strong>Supabase SQL Editor</strong> dashboard:
            </p>
            <pre className="p-3 bg-white dark:bg-black rounded-lg border border-card-border text-[11px] font-mono text-gold overflow-x-auto">
              {`update users\nset role = 'admin'\nwhere id = '${user.id}';`}
            </pre>
          </div>
        )}
      </div>
    );
  }

  const estCommission = clicksCount * 45;

  // Admin dashboard view
  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Page Header */}
      <div className="border-b border-card-border pb-4">
        <h1 className="text-xl sm:text-2xl font-black uppercase text-foreground font-display">
          {action === 'add-product' && "Add New Product"}
          {action === 'links' && "Affiliate Links Manager"}
          {action === 'guides' && "SEO Buying Guides Editor"}
          {action === 'dashboard' && "Console Overview"}
          {action === 'scout' && "AI Product Scout"}
          {action === 'drafts' && "Curation Draft Queue"}
          {action === 'scout-analytics' && "Scout Performance Analytics"}
        </h1>
        <p className="text-xs text-foreground/45 mt-1">
          {action === 'dashboard' && "Track clicks, traffic, and revenue estimations."}
          {action === 'add-product' && "Register a new product with multiple retailer outbound targets."}
          {action === 'links' && "Inspect commission targets and outbound traffic counts."}
          {action === 'guides' && "Draft and manage articles linking back to the product catalog."}
          {action === 'scout' && "Research and source candidate listings with LLM automation."}
          {action === 'drafts' && "Review generated trend candidates, add outbound links, and approve."}
          {action === 'scout-analytics' && "View job statistics, curation metrics, and category yields."}
        </p>
      </div>

      {/* DASHBOARD TAB */}
      {action === 'dashboard' && (
        <div className="space-y-8 animate-slide-up">
          {loadingStats ? (
            <div className="flex items-center justify-center min-h-[200px] text-foreground/50 text-xs font-semibold uppercase tracking-widest">
              <Loader2 className="w-5 h-5 animate-spin text-gold mr-2" />
              Loading metrics...
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white dark:bg-zinc-900 border border-card-border p-5 rounded-2xl md:rounded-3xl shadow-sm space-y-2">
                  <ShoppingBag className="w-5 h-5 text-gold" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-foreground/45">Total Products</span>
                    <p className="text-xl sm:text-2xl font-black">{productsCount}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-card-border p-5 rounded-2xl md:rounded-3xl shadow-sm space-y-2">
                  <MousePointer className="w-5 h-5 text-gold" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-foreground/45">Outbound Clicks</span>
                    <p className="text-xl sm:text-2xl font-black">{clicksCount}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-card-border p-5 rounded-2xl md:rounded-3xl shadow-sm space-y-2">
                  <FolderHeart className="w-5 h-5 text-gold" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-foreground/45">Product Saves</span>
                    <p className="text-xl sm:text-2xl font-black">{savesCount}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-card-border p-5 rounded-2xl md:rounded-3xl shadow-sm space-y-2">
                  <DollarSign className="w-5 h-5 text-gold" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-foreground/45">Est. Commissions</span>
                    <p className="text-xl sm:text-2xl font-black">₹{estCommission.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Top Products & Shares charts */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
                <div className="md:col-span-7 bg-white dark:bg-zinc-900 border border-card-border p-5 rounded-2xl md:rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Top Performing Products</h3>
                  <div className="space-y-3">
                    {topProducts.map((p, idx) => (
                      <div key={p.id} className="flex items-center justify-between gap-4 border-b border-card-border pb-2.5 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-bold text-foreground/45">#{idx+1}</span>
                          <div className="truncate">
                            <span className="text-xs font-bold text-foreground block truncate">{p.name}</span>
                            <span className="text-[9px] text-foreground/40 font-semibold">{p.brand}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 text-right">
                          <div className="text-[10px] font-bold uppercase">
                            <span className="text-foreground block">{p.click_count || 0} clicks</span>
                            <span className="text-foreground/40 font-medium">{p.save_count || 0} saves</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-5 space-y-6">
                  {/* Clicks By Retailer */}
                  <div className="bg-white dark:bg-zinc-900 border border-card-border p-5 rounded-2xl md:rounded-3xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Clicks By Retailer</h3>
                    <div className="space-y-4">
                      {retailerShares.length > 0 ? (
                        retailerShares.map((ret) => (
                          <div key={ret.name} className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                              <span className="text-foreground/60">{ret.name}</span>
                              <span className="text-foreground">{ret.count} ({Math.round(ret.share * 100)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gold rounded-full" style={{ width: `${ret.share * 100}%` }} />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-foreground/40 text-center py-6">No clicks logged yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Clicks By Trend Theme */}
                  <div className="bg-white dark:bg-zinc-900 border border-card-border p-5 rounded-2xl md:rounded-3xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Clicks By Trend Theme</h3>
                    <div className="space-y-4">
                      {trendShares.length > 0 ? (
                        trendShares.map((trend) => (
                          <div key={trend.name} className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                              <span className="text-foreground/60">{trend.name}</span>
                              <span className="text-foreground">{trend.count} ({Math.round(trend.share * 100)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gold rounded-full" style={{ width: `${trend.share * 100}%` }} />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-foreground/40 text-center py-6">No trend clicks logged yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ADD NEW PRODUCT FORM */}
      {action === 'add-product' && (
        <form onSubmit={handleAddProductSubmit} className="bg-white dark:bg-zinc-900 border border-card-border p-6 rounded-2xl md:rounded-3xl shadow-sm space-y-6 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Product Name *</label>
              <input
                type="text"
                placeholder="Retro mechanical keyboard..."
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Brand / Publisher *</label>
              <input
                type="text"
                placeholder="Keychron, Aesthetix, Bandai..."
                value={newProductBrand}
                onChange={(e) => setNewProductBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Base Price (INR) *</label>
              <input
                type="number"
                placeholder="1299"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Parent Category *</label>
              <select
                value={newProductCat}
                onChange={(e) => setNewProductCat(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
                required
              >
                <option value="">Select Category</option>
                {categoriesList.filter(c => c.parent_id === null).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Subcategory</label>
              <select
                value={newProductSub}
                onChange={(e) => setNewProductSub(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
              >
                <option value="">None (Keep Category level)</option>
                {categoriesList.filter(c => c.parent_id === newProductCat).map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55 block">Tag Trend Themes</label>
              <div className="flex flex-wrap gap-4 mt-1">
                {[
                  { slug: 'gimme-gummy', name: 'Gimme Gummy 🍬' },
                  { slug: 'afrohemian-decor', name: 'Afrohemian Decor 🏺' },
                  { slug: 'doily-era', name: 'Doily Era 🧶' }
                ].map(trend => {
                  const isChecked = selectedTrends.includes(trend.slug);
                  return (
                    <label key={trend.slug} className="flex items-center gap-2 text-xs font-semibold text-foreground/75 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTrends(prev => [...prev, trend.slug]);
                          } else {
                            setSelectedTrends(prev => prev.filter(t => t !== trend.slug));
                          }
                        }}
                        className="rounded border-card-border text-gold focus:ring-gold w-4 h-4"
                      />
                      <span>{trend.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Product Description</label>
            <textarea
              placeholder="Enter product details..."
              value={newProductDesc}
              onChange={(e) => setNewProductDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold h-24 resize-none"
            />
          </div>

          {/* Outbound URL mapping */}
          <div className="border-t border-card-border pt-4 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gold">Affiliate Link Redirect Targets</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Amazon Outbound URL</label>
                <input
                  type="url"
                  placeholder="https://www.amazon.in/dp/..."
                  value={amazonUrl}
                  onChange={(e) => setAmazonUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Nike/Keychron Outbound URL</label>
                <input
                  type="url"
                  placeholder="https://keychron.in/products/..."
                  value={nikeUrl}
                  onChange={(e) => setNikeUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Pros (comma separated)</label>
              <input
                type="text"
                placeholder="Premium metal base, linear switches"
                value={newProductPros}
                onChange={(e) => setNewProductPros(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Cons (comma separated)</label>
              <input
                type="text"
                placeholder="Heavy to carry, expensive pricing"
                value={newProductCons}
                onChange={(e) => setNewProductCons(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-foreground text-background hover:bg-gold hover:text-white dark:bg-foreground dark:text-background dark:hover:bg-gold dark:hover:text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add product to feed
          </button>
        </form>
      )}

      {/* LINKS MANAGER */}
      {action === 'links' && (
        <div className="bg-white dark:bg-zinc-900 border border-card-border rounded-2xl md:rounded-3xl shadow-sm overflow-hidden animate-slide-up">
          <div className="p-5 border-b border-card-border flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/45">Merchant list & active statuses</span>
          </div>

          <div className="overflow-x-auto">
            {loadingLinks ? (
              <div className="text-center py-10 text-foreground/50 text-xs font-semibold uppercase tracking-widest">
                <Loader2 className="w-4 h-4 animate-spin text-gold mr-2 inline" />
                fetching links...
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-card-border text-[9px] font-bold uppercase tracking-widest text-foreground/40 bg-gray-50/50 dark:bg-zinc-800/10">
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Retailer</th>
                    <th className="p-4">Outbound URL</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border font-semibold">
                  {linksList.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/5 transition-colors">
                      <td className="p-4 font-bold text-foreground">
                        <span className="block">{row.products?.name}</span>
                        <span className="text-[9px] text-foreground/40 font-medium">{row.products?.brand}</span>
                      </td>
                      <td className="p-4 text-foreground/60 uppercase">{row.retailer}</td>
                      <td className="p-4 text-foreground/40 truncate max-w-[200px]" title={row.raw_url}>{row.raw_url}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleLinkActive(row.id, row.is_active)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors ${
                            row.is_active 
                              ? "bg-green-150 text-green-700 hover:bg-red-100 hover:text-red-700" 
                              : "bg-red-150 text-red-700 hover:bg-green-100 hover:text-green-700"
                          }`}
                        >
                          {row.is_active ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* GUIDES MANAGER */}
      {action === 'guides' && (
        <div className="bg-white dark:bg-zinc-900 border border-card-border rounded-2xl md:rounded-3xl shadow-sm p-5 space-y-6 animate-slide-up">
          <div className="flex justify-between items-center border-b border-card-border pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/45">Current Articles List</span>
          </div>

          <div className="space-y-4">
            {guidesList.map((g) => (
              <div key={g.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-card-border bg-gray-50/30 dark:bg-zinc-800/5 hover:bg-gray-50 dark:hover:bg-zinc-800/10 transition-colors">
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate uppercase">{g.title}</h4>
                  <p className="text-[10px] text-foreground/40 truncate">{g.seo_description}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 self-end sm:self-auto">
                  <a 
                    href={`/guides/${g.slug}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="px-3 py-1.5 rounded-lg border border-card-border hover:bg-gray-150 text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 text-foreground"
                  >
                    View <ArrowUpRight className="w-3 h-3" />
                  </a>
                  <button 
                    onClick={() => addToast("Handbook editor is read-only in public console.", "info")}
                    className="px-3 py-1.5 rounded-lg bg-foreground text-background text-[10px] font-bold uppercase tracking-wide hover:bg-gold hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {action === 'scout' && <ScoutPanel />}
      {action === 'drafts' && <DraftQueuePanel />}
      {action === 'scout-analytics' && <ScoutAnalyticsPanel />}

    </div>
  );
}
