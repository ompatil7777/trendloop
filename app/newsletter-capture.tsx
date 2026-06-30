"use client";

import { useState } from "react";
import { useApp } from "../lib/context/AppContext";
import { analytics } from "../lib/analytics/trackEvent";
import { Mail, Check, ArrowRight } from "lucide-react";

export default function NewsletterCapture() {
  const { addToast } = useApp();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      addToast("Please enter a valid email address.", "error");
      return;
    }

    setStatus('loading');
    
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Track newsletter signup
    analytics.newsletterSignup(email, "homepage_rail");
    
    setStatus('success');
    addToast("Welcome to the loop! check your inbox soon.", "success");
    setEmail("");
  };

  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-card-border bg-[#fcfcfc] dark:bg-[#111113] p-8 md:p-12 shadow-sm">
      {/* Background decorations for premium luxury styling */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-80 h-80 rounded-full bg-gold/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-80 h-80 rounded-full bg-gold/5 blur-3xl" />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-gold-light flex items-center justify-center text-gold">
          {status === 'success' ? <Check className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground font-display">
            {status === 'success' ? "You're in the loop!" : "Join the Weekly Trendloop"}
          </h2>
          <p className="text-xs sm:text-sm text-foreground/50 max-w-md mx-auto leading-relaxed">
            {status === 'success' 
              ? "We'll ping you as soon as the next streetwear drops or curated room setups land. No spam, ever." 
              : "Get curated collections, budget streetwear finds, and mechanical keyboard setups delivered directly to your inbox every Sunday morning."
            }
          </p>
        </div>

        {status !== 'success' && (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto w-full pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={status === 'loading'}
              className="flex-grow px-4 py-3 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground placeholder-foreground/40 focus:outline-none focus:border-gold transition-colors"
              required
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 rounded-xl bg-foreground text-background hover:bg-gold hover:text-white dark:bg-foreground dark:text-background dark:hover:bg-gold dark:hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              {status === 'loading' ? "joining..." : "Subscribe"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {status === 'success' && (
          <button
            onClick={() => setStatus('idle')}
            className="text-[10px] font-bold uppercase tracking-widest text-gold hover:underline"
          >
            Sign up another email
          </button>
        )}
      </div>
    </section>
  );
}
