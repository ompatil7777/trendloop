"use client";

import { useState, useEffect } from "react";
import { Sparkles, Play, ListFilter, AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useApp } from "../../lib/context/AppContext";

interface Job {
  id: string;
  query_text: string;
  filters_json: {
    limit: number;
    category?: string;
    minRating?: number;
    minReviews?: number;
    minTrendScore?: number;
  };
  status: "pending" | "running" | "completed" | "failed";
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
  import_logs?: {
    candidates_found: number;
    candidates_passed_filters: number;
    drafts_created: number;
  }[];
}

export default function ScoutPanel() {
  const { addToast } = useApp();
  const [query, setQuery] = useState("");
  const [count, setCount] = useState("10");
  const [category, setCategory] = useState("all");
  const [minRating, setMinRating] = useState("4.0");
  const [minReviews, setMinReviews] = useState("50");
  const [minTrendScore, setMinTrendScore] = useState("70");
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [submittingJob, setSubmittingJob] = useState(false);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/admin/scout/run");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Auto-refresh jobs list every 8 seconds if there are running/pending jobs
    const interval = setInterval(() => {
      const hasActive = jobs.some(j => j.status === "running" || j.status === "pending");
      if (hasActive) fetchJobs();
    }, 8000);

    return () => clearInterval(interval);
  }, [jobs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      addToast("Please specify a search query", "error");
      return;
    }

    setSubmittingJob(true);
    try {
      const res = await fetch("/api/admin/scout/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          count: parseInt(count, 10),
          category: category !== "all" ? category : undefined,
          minRating: parseFloat(minRating),
          minReviews: parseInt(minReviews, 10),
          minTrendScore: parseInt(minTrendScore, 10),
        }),
      });

      if (res.ok) {
        addToast("AI Scout job queued successfully!", "success");
        setQuery("");
        fetchJobs();
      } else {
        const err = await res.json();
        addToast(err.error || "Failed to trigger scout job", "error");
      }
    } catch (err) {
      console.error("Error submitting job:", err);
      addToast("Network error submitting job", "error");
    } finally {
      setSubmittingJob(false);
    }
  };

  const categories = [
    { label: "All Categories", value: "all" },
    { label: "Streetwear", value: "Streetwear" },
    { label: "Gaming Setup", value: "Gaming Setup" },
    { label: "Anime Aesthetics", value: "Anime Aesthetics" },
    { label: "Room Decor", value: "Room Decor" },
    { label: "Fitness", value: "Fitness" }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-foreground">
      
      {/* 1. INPUT FORM */}
      <section className="bg-white dark:bg-zinc-900 border border-card-border rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-gold" />
          <h2 className="text-lg font-black uppercase tracking-wider">Queue AI Product Scout</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Query input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">
              Natural Language Request
            </label>
            <input
              type="text"
              placeholder="e.g. Find 25 trending anime LED room decoration lights..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Limit count */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                Number of Products
              </label>
              <select
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-foreground text-xs font-semibold focus:outline-none"
              >
                {["10", "25", "50", "100", "200"].map(c => (
                  <option key={c} value={c}>{c} Candidates</option>
                ))}
              </select>
            </div>

            {/* Target Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                Aesthetics Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-foreground text-xs font-semibold focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Min Trend Score */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                Min Trend Score (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={minTrendScore}
                onChange={(e) => setMinTrendScore(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-foreground text-xs font-semibold focus:outline-none"
              />
            </div>

            {/* Min rating */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                Min Rating Stars
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-foreground text-xs font-semibold focus:outline-none"
              />
            </div>

            {/* Min reviews */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                Min Reviews Count
              </label>
              <input
                type="number"
                min="0"
                value={minReviews}
                onChange={(e) => setMinReviews(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-card-border bg-gray-50 dark:bg-zinc-950 text-foreground text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submittingJob}
              className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-gold hover:text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {submittingJob ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Queuing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Curation Pipeline
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 2. RECENT JOBS TABLE */}
      <section className="bg-white dark:bg-zinc-900 border border-card-border rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-foreground/60" />
            <h2 className="text-lg font-black uppercase tracking-wider">Research Runs History</h2>
          </div>
          <button
            onClick={fetchJobs}
            disabled={loadingJobs}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-foreground transition-colors disabled:opacity-50"
            title="Refresh History"
          >
            <RefreshCw className={`w-4 h-4 ${loadingJobs ? "animate-spin text-gold" : ""}`} />
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-card-border rounded-2xl text-foreground/45 text-sm">
            No research jobs have been triggered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-card-border text-foreground/40 font-bold uppercase tracking-wider pb-3">
                  <th className="pb-3">Query</th>
                  <th className="pb-3">Parameters</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Curation Logs</th>
                  <th className="pb-3">Queued At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border font-medium">
                {jobs.map((job) => {
                  const log = job.import_logs?.[0];
                  return (
                    <tr key={job.id} className="text-foreground/80 hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                      <td className="py-4 font-semibold text-foreground truncate max-w-xs">{job.query_text}</td>
                      <td className="py-4">
                        <div className="flex flex-col gap-0.5 text-[10px] text-foreground/50">
                          <span>Limit: {job.filters_json.limit}</span>
                          {job.filters_json.category && <span>Cat: {job.filters_json.category}</span>}
                          {job.filters_json.minTrendScore && <span>Min Trend: {job.filters_json.minTrendScore}</span>}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          job.status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                          job.status === "failed" ? "bg-red-500/10 text-red-500" :
                          job.status === "running" ? "bg-amber-500/10 text-amber-500 animate-pulse" :
                          "bg-gray-500/10 text-gray-500"
                        }`}>
                          {job.status === "running" && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                          {job.status === "completed" && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {job.status === "failed" && <AlertCircle className="w-2.5 h-2.5" />}
                          {job.status}
                        </span>
                      </td>
                      <td className="py-4">
                        {log ? (
                          <div className="text-[10px] text-foreground/60 space-y-0.5">
                            <div>Found: <span className="font-bold text-foreground">{log.candidates_found}</span></div>
                            <div>Drafts: <span className="font-bold text-gold">{log.drafts_created}</span></div>
                          </div>
                        ) : job.status === "failed" ? (
                          <span className="text-red-500 font-normal italic text-[10px] block max-w-xs truncate" title={job.error_message || ""}>
                            {job.error_message || "Unknown error"}
                          </span>
                        ) : (
                          <span className="text-foreground/45 italic">Awaiting logs...</span>
                        )}
                      </td>
                      <td className="py-4 text-foreground/40 text-[10px]">
                        {new Date(job.created_at).toLocaleString("en-IN", {
                          hour: "numeric",
                          minute: "numeric",
                          second: "numeric",
                          day: "numeric",
                          month: "short"
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
