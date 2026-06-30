import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export const metadata = {
  title: "About Trendloop — Gen-Z Discovery Platform",
  description: "Learn how we are redefining shopping as visual trend discovery.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans text-foreground/80">
      
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-foreground/45 hover:text-foreground text-xs font-bold uppercase tracking-widest transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Home
      </Link>

      <div className="space-y-4 border-b border-card-border pb-6">
        <span className="text-[10px] font-bold text-gold uppercase tracking-widest font-display">Who We Are</span>
        <h1 className="text-2xl sm:text-4xl font-extrabold uppercase text-foreground font-display leading-tight">
          About Trendloop
        </h1>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        <div className="p-6 bg-gold-light rounded-2xl border border-gold-light/20 flex gap-4 items-start">
          <Sparkles className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
          <p className="font-semibold text-foreground">
            Trendloop is founded on a simple premise: products should be content, not inventory. 
          </p>
        </div>

        <p>
          We realized that online shopping has become purely transactional. You search for a term, compare specifications, read pages of reviews, add to cart, and check out. It feels like sorting databases.
        </p>

        <p>
          But the way we discover what we like is organic. It happens while browsing Instagram, scrolling Pinterest, and viewing home setup reels. We wanted to build a place dedicated purely to that <strong>discovery spark</strong>.
        </p>

        <p>
          Trendloop curates the standout pieces of Gen-Z aesthetics. We track fashion boards, tech setups, anime collections, and fitness movements to bring you a clean, masonry feed of the vibe.
        </p>

        <p>
          We do not sell items directly. We compile, review, style, and redirect. Trendloop is design-led, minimal, and fast, helping you explore and curate your own look.
        </p>
      </div>

    </div>
  );
}
