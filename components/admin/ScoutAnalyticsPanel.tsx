"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Sparkles, 
  FileCheck, 
  FileEdit, 
  Trash2, 
  HelpCircle, 
  Loader2, 
  TrendingUp, 
  ChevronRight,
  TrendingDown
} from "lucide-react";
import { useApp } from "../../lib/context/AppContext";

interface AnalyticsStats {
  jobsCount: number;
  candidatesCount: number;
  draftsCount: number;
  publishedCount: number;
  categoryShares: { category: string; count: number; percentage: number }[];
  history: { id: string; action: string; created_at: string; draft_products?: { name: string } }[];
}

export default function ScoutAnalyticsPanel() {
  const { addToast } = useApp();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch stats from draft endpoints or custom logic
      const res = await fetch("/api/admin/scout/drafts?status=published");
      const draftsRes = await res.json();
      const allDrafts = draftsRes.drafts || [];
      
      const jobsRes = await fetch("/api/admin/scout/run");
      const jobs = (await jobsRes.json()).jobs || [];

      // Calculate aggregated metrics
      const jobsCount = jobs.length;
      let candidatesCount = 0;
      let draftsCount = allDrafts.length; // total published drafts found in this tab
      
      jobs.forEach((j: any) => {
        const log = j.import_logs?.[0];
        if (log) {
          candidatesCount += log.candidates_found || 0;
        }
      });

      // Get count of draft products grouped by status
      // We will make a custom fetch to check count of all draft products
      const allRes = await fetch("/api/admin/scout/drafts?status=draft");
      const activeDrafts = (await allRes.json()).drafts || [];
      
      const approvedRes = await fetch("/api/admin/scout/drafts?status=approved");
      const approvedDrafts = (await approvedRes.json()).drafts || [];

      const totalDraftsCreated = activeDrafts.length + approvedDrafts.length + allDrafts.length;

      // Group by Category
      const categoriesMap: Record<string, number> = {};
      [...activeDrafts, ...approvedDrafts, ...allDrafts].forEach((d: any) => {
        categoriesMap[d.category] = (categoriesMap[d.category] || 0) + 1;
      });

      const totalGrouped = Object.values(categoriesMap).reduce((a, b) => a + b, 0);
      const categoryShares = Object.entries(categoriesMap).map(([category, count]) => ({
        category,
        count,
        percentage: totalGrouped > 0 ? Math.round((count / totalGrouped) * 100) : 0
      })).sort((a, b) => b.count - a.count);

      setStats({
        jobsCount,
        candidatesCount,
        draftsCount: totalDraftsCreated,
        publishedCount: allDrafts.length,
        categoryShares,
        history: [], // Can fetch approval logs if needed
      });
    } catch (err) {
      console.error("Error loading scout analytics:", err);
      addToast("Failed to compile analytics summary", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-foreground/50 text-xs font-semibold uppercase tracking-widest bg-white dark:bg-zinc-900 border border-card-border rounded-3xl">
        <Loader2 className="w-5 h-5 animate-spin text-gold mr-2" />
        Compiling Scout Analytics...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-foreground">
      
      {/* 1. STATS OVERVIEW GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Jobs run */}
        <div className="bg-white dark:bg-zinc-900 border border-card-border p-5 rounded-3xl shadow-sm space-y-2">
          <BarChart3 className="w-5 h-5 text-gold" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-foreground/45">Research Jobs Run</span>
            <div className="text-2xl font-black">{stats?.jobsCount}</div>
          </div>
        </div>

        {/* Candidates Found */}
        <div className="bg-white dark:bg-zinc-900 border border-card-border p-5 rounded-3xl shadow-sm space-y-2">
          <Sparkles className="w-5 h-5 text-gold" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-foreground/45">Candidates Found</span>
            <div className="text-2xl font-black">{stats?.candidatesCount}</div>
          </div>
        </div>

        {/* Drafts Created */}
        <div className="bg-white dark:bg-zinc-900 border border-card-border p-5 rounded-3xl shadow-sm space-y-2">
          <FileEdit className="w-5 h-5 text-gold" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-foreground/45">Drafts Created</span>
            <div className="text-2xl font-black">{stats?.draftsCount}</div>
          </div>
        </div>

        {/* Published Listings */}
        <div className="bg-white dark:bg-zinc-900 border border-card-border p-5 rounded-3xl shadow-sm space-y-2">
          <FileCheck className="w-5 h-5 text-gold" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-foreground/45">Approved & Published</span>
            <div className="text-2xl font-black text-emerald-500">{stats?.publishedCount}</div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 2. CATEGORY SHARES */}
        <section className="bg-white dark:bg-zinc-900 border border-card-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-card-border pb-3">
            <TrendingUp className="w-5 h-5 text-gold" />
            <h2 className="text-sm font-black uppercase tracking-wider">Curation Volume by Category</h2>
          </div>

          {stats?.categoryShares.length === 0 ? (
            <div className="text-center py-8 text-foreground/40 text-xs italic">
              No products categorized yet.
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.categoryShares.map((share) => (
                <div key={share.category} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="uppercase text-foreground/80">{share.category}</span>
                    <span className="text-foreground/40">{share.count} items ({share.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-zinc-950 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gold h-full rounded-full transition-all duration-500" 
                      style={{ width: `${share.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. DRAFT PIPELINE METRICS */}
        <section className="bg-white dark:bg-zinc-900 border border-card-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-card-border pb-3">
            <HelpCircle className="w-5 h-5 text-foreground/60" />
            <h2 className="text-sm font-black uppercase tracking-wider">Curation Funnel Health</h2>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-between items-center py-2.5 border-b border-card-border">
              <span className="text-foreground/50 uppercase">Import Conversion Ratio</span>
              <span className="font-bold text-foreground">
                {stats && stats.candidatesCount > 0 
                  ? `${Math.round((stats.draftsCount / stats.candidatesCount) * 100)}%`
                  : "0%"
                }
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-card-border">
              <span className="text-foreground/50 uppercase">Approval Approval Rate</span>
              <span className="font-bold text-foreground">
                {stats && stats.draftsCount > 0 
                  ? `${Math.round((stats.publishedCount / stats.draftsCount) * 100)}%`
                  : "0%"
                }
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5">
              <span className="text-foreground/50 uppercase">Affiliate Link Coverage</span>
              <span className="font-bold text-emerald-500">100% (Enforced)</span>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
