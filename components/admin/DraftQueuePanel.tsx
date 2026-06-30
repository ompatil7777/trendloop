"use client";

import { useState, useEffect } from "react";
import { 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  Eye, 
  ExternalLink, 
  AlertTriangle, 
  Link2,
  BookmarkCheck,
  TrendingUp,
  FolderOpen,
  CheckCircle,
  HelpCircle,
  FileCheck,
  RefreshCw,
  Search
} from "lucide-react";
import { useApp } from "../../lib/context/AppContext";
import ProductPreviewModal from "./ProductPreviewModal";

interface Draft {
  id: string;
  name: string;
  seo_title: string;
  short_description: string;
  long_description: string;
  features_json: string[];
  category: string;
  subcategory: string;
  tags_json: string[];
  price: number;
  trend_score: number;
  trend_score_breakdown_json: any;
  data_confidence: "verified" | "partial" | "unverified";
  status: "draft" | "approved" | "rejected" | "published";
  created_at: string;
  product_candidates?: {
    source_url: string;
    source_name: string;
    image_urls_json: string[];
    rating: number | null;
    review_count: number | null;
  };
  affiliate_links?: {
    raw_url: string;
    network_name: string;
  }[];
}

export default function DraftQueuePanel() {
  const { addToast, formatPrice } = useApp();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtering & Sorting State
  const [statusFilter, setStatusFilter] = useState("draft");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("trend_score");
  const [searchTerm, setSearchTerm] = useState("");

  // Bulk Operations State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAffUrl, setBulkAffUrl] = useState("");
  const [bulkNetwork, setBulkNetwork] = useState("amazon");
  const [showBulkLinkBox, setShowBulkLinkBox] = useState(false);

  // Per-Item Actions State (Affiliate URL, Network)
  const [affUrls, setAffUrls] = useState<Record<string, string>>({});
  const [affNetworks, setAffNetworks] = useState<Record<string, string>>({});

  // Editing Modal State
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSubcategory, setEditSubcategory] = useState("");
  const [editTagsText, setEditTagsText] = useState("");

  // Preview Modal State
  const [previewDraft, setPreviewDraft] = useState<Draft | null>(null);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/scout/drafts?status=${statusFilter}&category=${categoryFilter}&sortBy=${sortBy}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDrafts(data.drafts || []);
        
        // Initialize affiliate inputs for each draft if present
        const urls: Record<string, string> = {};
        const nets: Record<string, string> = {};
        (data.drafts || []).forEach((d: Draft) => {
          if (d.affiliate_links && d.affiliate_links.length > 0) {
            urls[d.id] = d.affiliate_links[0].raw_url;
            nets[d.id] = d.affiliate_links[0].network_name || "amazon";
          } else {
            urls[d.id] = "";
            nets[d.id] = "amazon";
          }
        });
        setAffUrls(urls);
        setAffNetworks(nets);
        setSelectedIds([]); // clear selection on list refresh
      }
    } catch (err) {
      console.error("Failed to load drafts:", err);
      addToast("Failed to fetch drafts list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [statusFilter, categoryFilter, sortBy]);

  const handleUpdateStatus = async (draftId: string, newStatus: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/admin/scout/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-status",
          draftId,
          status: newStatus,
        }),
      });

      if (res.ok) {
        addToast(`Draft status updated to ${newStatus}`, "success");
        fetchDrafts();
      } else {
        const err = await res.json();
        addToast(err.error || "Failed to update draft", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error updating status", "error");
    }
  };

  const handleDelete = async (draftId: string) => {
    if (!confirm("Are you sure you want to permanently delete this draft product candidate?")) return;
    try {
      const res = await fetch("/api/admin/scout/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          draftId,
        }),
      });

      if (res.ok) {
        addToast("Draft product discarded", "info");
        fetchDrafts();
      } else {
        addToast("Failed to delete draft", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error deleting draft", "error");
    }
  };

  const handlePublish = async (draftId: string) => {
    const url = affUrls[draftId];
    const network = affNetworks[draftId];

    if (!url || !url.trim()) {
      addToast("Cannot publish: An outbound affiliate URL is required.", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/scout/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          draftId,
          affiliateUrl: url.trim(),
          networkName: network,
        }),
      });

      if (res.ok) {
        addToast("Product approved and published atomically!", "success");
        fetchDrafts();
      } else {
        const err = await res.json();
        addToast(err.error || "Failed to publish product", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Publish operation crashed", "error");
    }
  };

  // Edit Modal triggers
  const startEdit = (draft: Draft) => {
    setEditingDraft(draft);
    setEditName(draft.name);
    setEditPrice(String(draft.price));
    setEditCategory(draft.category);
    setEditSubcategory(draft.subcategory || "");
    setEditTagsText((draft.tags_json || []).join(", "));
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDraft) return;

    try {
      const tagsArray = editTagsText
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const res = await fetch("/api/admin/scout/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          draftId: editingDraft.id,
          name: editName.trim(),
          price: parseFloat(editPrice) || 0,
          category: editCategory.trim(),
          subcategory: editSubcategory.trim(),
          tags: tagsArray,
        }),
      });

      if (res.ok) {
        addToast("Draft details saved", "success");
        setEditingDraft(null);
        fetchDrafts();
      } else {
        addToast("Failed to save changes", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error editing draft", "error");
    }
  };

  // Checkbox management
  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDrafts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDrafts.map(d => d.id));
    }
  };

  // Bulk operations
  const handleBulkStatusChange = async (newStatus: "approved" | "rejected") => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch("/api/admin/scout/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-status",
          draftIds: selectedIds,
          status: newStatus,
        }),
      });

      if (res.ok) {
        addToast(`Bulk updated ${selectedIds.length} drafts to ${newStatus}`, "success");
        fetchDrafts();
      }
    } catch (err) {
      console.error(err);
      addToast("Bulk status update failed", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently discard these ${selectedIds.length} draft candidates?`)) return;
    try {
      const res = await fetch("/api/admin/scout/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-delete",
          draftIds: selectedIds,
        }),
      });

      if (res.ok) {
        addToast("Bulk delete completed", "info");
        fetchDrafts();
      }
    } catch (err) {
      console.error(err);
      addToast("Bulk delete failed", "error");
    }
  };

  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) return;

    // Filter out candidates without affiliate link inputs
    const publishableItems = selectedIds
      .map(id => ({
        draftId: id,
        affiliateUrl: affUrls[id] || "",
        networkName: affNetworks[id] || "amazon",
      }))
      .filter(item => item.affiliateUrl.trim().length > 0);

    const missingLinksCount = selectedIds.length - publishableItems.length;

    if (publishableItems.length === 0) {
      addToast("Cannot bulk publish: None of the selected items have an affiliate link URL.", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/scout/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-publish",
          items: publishableItems,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        addToast(`Bulk publish completed: ${data.publishedCount} published, ${data.skippedCount + missingLinksCount} skipped.`, "success");
        fetchDrafts();
      }
    } catch (err) {
      console.error(err);
      addToast("Bulk publish execution crashed", "error");
    }
  };

  const applyBulkAffLinks = () => {
    if (!bulkAffUrl.trim()) {
      addToast("Please provide an affiliate URL pattern", "error");
      return;
    }
    const updatedUrls = { ...affUrls };
    const updatedNetworks = { ...affNetworks };
    
    selectedIds.forEach(id => {
      // Replaces product placeholder with draft ID if present in bulk template
      const formattedUrl = bulkAffUrl.replace("[[DRAFT_ID]]", id);
      updatedUrls[id] = formattedUrl;
      updatedNetworks[id] = bulkNetwork;
    });

    setAffUrls(updatedUrls);
    setAffNetworks(updatedNetworks);
    setShowBulkLinkBox(false);
    setBulkAffUrl("");
    addToast(`Applied affiliate link template to ${selectedIds.length} items.`, "info");
  };

  // Local Search filtering
  const filteredDrafts = drafts.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.seo_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-foreground">
      
      {/* 1. FILTERING TOOLBAR */}
      <section className="bg-white dark:bg-zinc-900 border border-card-border rounded-3xl p-6 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        
        {/* Left: Tab selection */}
        <div className="flex bg-gray-100 dark:bg-zinc-950 p-1.5 rounded-xl border border-card-border">
          {["draft", "approved", "rejected", "published"].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setSelectedIds([]); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                statusFilter === s
                  ? "bg-white dark:bg-zinc-900 text-gold shadow-sm"
                  : "text-foreground/50 hover:text-foreground"
              }`}
            >
              {s}s
            </button>
          ))}
        </div>

        {/* Right: Category filters, search, refresh */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search drafts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-xs focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-foreground/40 absolute left-2.5 top-3" />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-xs font-semibold text-foreground"
          >
            {["all", "Streetwear", "Gaming Setup", "Anime Aesthetics", "Room Decor", "Fitness"].map(c => (
              <option key={c} value={c}>{c === "all" ? "All aesthetics" : c}</option>
            ))}
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-xs font-semibold text-foreground"
          >
            <option value="trend_score">Sort by Trend Score</option>
            <option value="newest">Sort by Newest</option>
          </select>

          <button
            onClick={fetchDrafts}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 border border-card-border text-foreground transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-gold" : ""}`} />
          </button>
        </div>
      </section>

      {/* 2. BULK OPERATIONS BAR (Visible only when drafts are selected) */}
      {selectedIds.length > 0 && (
        <section className="bg-foreground text-background dark:bg-zinc-900 border border-card-border rounded-3xl p-5 shadow-lg flex flex-wrap gap-4 items-center justify-between animate-slide-up">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-gold">{selectedIds.length} Selected</span>
            <div className="h-4 w-px bg-background/20" />
            <button
              onClick={() => handleBulkStatusChange("approved")}
              className="text-[10px] font-bold uppercase tracking-wider hover:text-gold flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Approve
            </button>
            <button
              onClick={() => handleBulkStatusChange("rejected")}
              className="text-[10px] font-bold uppercase tracking-wider hover:text-gold flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
            <button
              onClick={handleBulkDelete}
              className="text-[10px] font-bold uppercase tracking-wider hover:text-red-500 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Discard
            </button>
            <button
              onClick={() => setShowBulkLinkBox(!showBulkLinkBox)}
              className="text-[10px] font-bold uppercase tracking-wider hover:text-gold flex items-center gap-1.5 transition-colors"
            >
              <Link2 className="w-3.5 h-3.5" /> Add Links
            </button>
          </div>

          <button
            onClick={handleBulkPublish}
            className="bg-gold text-white hover:bg-gold-hover px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <BookmarkCheck className="w-4 h-4" /> Bulk Publish
          </button>

          {/* Bulk Link Overlay Panel */}
          {showBulkLinkBox && (
            <div className="w-full mt-4 p-4 rounded-2xl bg-background text-foreground border border-card-border space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-card-border">
                <span className="text-xs font-bold uppercase tracking-wider">Bulk Add Affiliate Link Template</span>
                <button onClick={() => setShowBulkLinkBox(false)} className="text-[10px] font-bold uppercase hover:text-gold">Close</button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Link pattern... e.g. https://amazon.in/dp/[[DRAFT_ID]]?tag=trendloop-21"
                  value={bulkAffUrl}
                  onChange={(e) => setBulkAffUrl(e.target.value)}
                  className="flex-grow px-3 py-2 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-xs focus:outline-none"
                />
                <select
                  value={bulkNetwork}
                  onChange={(e) => setBulkNetwork(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-xs font-semibold"
                >
                  <option value="amazon">Amazon</option>
                  <option value="nike">Nike</option>
                  <option value="keychron">Keychron</option>
                  <option value="myntra">Myntra</option>
                  <option value="flipkart">Flipkart</option>
                </select>
                <button
                  onClick={applyBulkAffLinks}
                  className="bg-foreground text-background hover:bg-gold hover:text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Apply Template
                </button>
              </div>
              <p className="text-[10px] text-foreground/45 italic leading-relaxed">
                Use <code className="bg-gray-150 px-1 rounded">[[DRAFT_ID]]</code> inside the URL string to dynamically substitute each draft product's unique database UUID.
              </p>
            </div>
          )}
        </section>
      )}

      {/* 3. DRAFTS QUEUE LIST */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-foreground/50 text-xs font-semibold uppercase tracking-widest bg-white dark:bg-zinc-900 border border-card-border rounded-3xl">
          <RefreshCw className="w-5 h-5 animate-spin text-gold mr-2" />
          Loading Draft Listings...
        </div>
      ) : filteredDrafts.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-card-border rounded-3xl bg-white dark:bg-zinc-900">
          <FolderOpen className="w-10 h-10 text-foreground/30 mx-auto mb-4" />
          <p className="text-foreground/50 text-sm font-medium">No drafts found in this queue state.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredDrafts.map((draft) => {
            const cand = draft.product_candidates;
            const previewImage = cand?.image_urls_json?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
            const isSelected = selectedIds.includes(draft.id);

            return (
              <div 
                key={draft.id}
                className={`bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm transition-all duration-200 flex flex-col md:flex-row gap-6 relative ${
                  isSelected ? "border-gold ring-1 ring-gold/40" : "border-card-border hover:shadow-md"
                }`}
              >
                {/* Checkbox selector */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(draft.id)}
                    className="w-4.5 h-4.5 rounded border-card-border accent-gold focus:ring-gold"
                  />
                </div>

                {/* Candidate Image Gallery Cover */}
                <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden bg-gray-50 dark:bg-zinc-950 flex-shrink-0 relative border border-card-border">
                  <img
                    src={previewImage}
                    alt={draft.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Dynamic Confidence Marker */}
                  <span className={`absolute bottom-2 right-2 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                    draft.data_confidence === "verified" ? "bg-emerald-500 text-white" :
                    draft.data_confidence === "partial" ? "bg-amber-500 text-white" :
                    "bg-red-500 text-white"
                  }`}>
                    {draft.data_confidence}
                  </span>
                </div>

                {/* Listing metadata details */}
                <div className="flex-grow flex flex-col justify-between py-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-foreground/45 border border-card-border px-2 py-0.5 rounded">
                        {draft.category}
                      </span>
                      {draft.subcategory && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-foreground/35 border border-card-border px-2 py-0.5 rounded bg-gray-50 dark:bg-zinc-950">
                          {draft.subcategory}
                        </span>
                      )}
                      
                      {/* Trend score card */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gold bg-gold-light px-2.5 py-0.5 rounded-full ml-auto">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Score: {draft.trend_score}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold uppercase tracking-tight text-foreground font-display">
                      {draft.name}
                    </h3>
                    
                    <p className="text-xs text-foreground/70 leading-relaxed font-sans line-clamp-3">
                      {draft.short_description}
                    </p>

                    {/* Sourced stats info */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-foreground/45 font-semibold pt-1">
                      {cand?.rating && <span>Rating: <strong className="text-foreground">{cand.rating} ⭐</strong></span>}
                      {cand?.review_count && <span>Reviews: <strong className="text-foreground">{cand.review_count}</strong></span>}
                      <span>Sourced Price: <strong className="text-foreground">{formatPrice(draft.price)}</strong></span>
                      {cand?.source_url && (
                        <a 
                          href={cand.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gold hover:underline inline-flex items-center gap-0.5"
                        >
                          Verify Source <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Affiliate Link Input Fields */}
                  {statusFilter !== "published" && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-card-border items-center">
                      <div className="flex items-center gap-1 text-foreground/40 self-start sm:self-center mt-1 sm:mt-0">
                        <Link2 className="w-3.5 h-3.5 text-gold" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Affiliate mapping</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Paste outbound affiliate link URL..."
                        value={affUrls[draft.id] || ""}
                        onChange={(e) => setAffUrls({ ...affUrls, [draft.id]: e.target.value })}
                        className="w-full sm:flex-grow px-3 py-2 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-xs focus:outline-none"
                      />
                      <select
                        value={affNetworks[draft.id] || "amazon"}
                        onChange={(e) => setAffNetworks({ ...affNetworks, [draft.id]: e.target.value })}
                        className="px-3 py-2 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-xs font-semibold text-foreground shrink-0"
                      >
                        <option value="amazon">Amazon</option>
                        <option value="nike">Nike</option>
                        <option value="keychron">Keychron</option>
                        <option value="myntra">Myntra</option>
                        <option value="flipkart">Flipkart</option>
                      </select>
                    </div>
                  )}

                  {/* Actions Buttons */}
                  <div className="flex flex-wrap gap-2.5 pt-3 border-t border-card-border justify-end items-center">
                    <button
                      onClick={() => setPreviewDraft(draft)}
                      className="px-4 py-2 rounded-xl border border-card-border hover:bg-gray-100 dark:hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview Page
                    </button>
                    <button
                      onClick={() => startEdit(draft)}
                      className="px-4 py-2 rounded-xl border border-card-border hover:bg-gray-100 dark:hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Copy
                    </button>
                    <button
                      onClick={() => handleDelete(draft.id)}
                      className="px-4 py-2 rounded-xl border border-card-border hover:bg-red-500/10 hover:text-red-500 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Discard
                    </button>
                    
                    <div className="h-5 w-px bg-card-border mx-1" />

                    {draft.status === "draft" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(draft.id, "approved")}
                          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-emerald-500/15 hover:text-emerald-600 dark:bg-zinc-800 dark:hover:bg-emerald-500/20 text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(draft.id, "rejected")}
                          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-red-500/15 hover:text-red-500 dark:bg-zinc-800 dark:hover:bg-red-500/20 text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {draft.status === "approved" && (
                      <button
                        onClick={() => handlePublish(draft.id)}
                        className="px-5 py-2 rounded-xl bg-foreground text-background hover:bg-gold hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
                      >
                        <FileCheck className="w-3.5 h-3.5" /> Approve & Publish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. EDIT DRAFT MODAL */}
      {editingDraft && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={saveEdit}
            className="bg-white dark:bg-zinc-900 border border-card-border rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-4 shadow-2xl text-foreground"
          >
            <div className="flex items-center justify-between pb-3 border-b border-card-border">
              <h3 className="text-base font-extrabold uppercase tracking-wider">Edit Draft metadata</h3>
              <button type="button" onClick={() => setEditingDraft(null)} className="p-1 hover:text-gold"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Draft Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-xs focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Base Price (INR)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-xs focus:outline-none focus:border-gold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Aesthetic Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-xs font-semibold focus:outline-none"
                  >
                    {["Streetwear", "Gaming Setup", "Anime Aesthetics", "Room Decor", "Fitness"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Subcategory</label>
                <input
                  type="text"
                  value={editSubcategory}
                  onChange={(e) => setEditSubcategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editTagsText}
                  onChange={(e) => setEditTagsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-xs focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-card-border flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingDraft(null)}
                className="px-5 py-2.5 rounded-xl border border-card-border hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-foreground text-background hover:bg-gold hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Save Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. PREVIEW DRAFT MODAL */}
      {previewDraft && (
        <ProductPreviewModal
          product={{
            id: previewDraft.id,
            name: previewDraft.name,
            description: previewDraft.long_description,
            price: previewDraft.price,
            brand: "Curated Vibe",
            images: previewDraft.product_candidates?.image_urls_json?.map((url, idx) => ({ url, alt: previewDraft.name, order: idx })) || [],
            features: previewDraft.features_json || [],
            pros: (previewDraft as any).pros_json || [],
            cons: (previewDraft as any).cons_json || [],
            is_trending: previewDraft.trend_score >= 85,
          }}
          affiliateUrl={affUrls[previewDraft.id] || ""}
          retailer={affNetworks[previewDraft.id] as any || "amazon"}
          onClose={() => setPreviewDraft(null)}
        />
      )}
    </div>
  );
}
