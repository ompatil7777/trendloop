import { notFound } from "next/navigation";
import { getProducts } from "../../../lib/data/products";
import DiscoverClient from "../../discover/discover-client";
import Link from "next/link";
import { ArrowLeft, Sparkles, Send } from "lucide-react";

interface TrendDetail {
  title: string;
  description: string;
  editorialText: string;
  whyTrending: string;
  image: string;
  trendTag: string;
  titleTag: string;
}

const trendsData: Record<string, TrendDetail> = {
  "gimme-gummy": {
    title: "Gimme Gummy 🍬",
    description: "Bendy, jelly-textured, impossible not to touch — the tactile trend taking over phone cases, nails, and beauty.",
    editorialText: "Gimme Gummy is 2026's answer to sensory overload — soft, squeezable textures that feel as good as they look. Think rubberized phone cases, bouncy nail art, and beauty products with a literal bounce. It's a trend with Gen Z's fingerprints all over it, and it's only getting bendier.",
    whyTrending: "Tactile tech and rubberized beauty are surging as counter-reactions to cold, metallic digital interfaces. This aesthetic offers cozy, play-dough-like physical objects that feel secure and fun in hand. Social media clips highlighting tactile phone tap tests and jelly product squeeze swatches are driving massive engagement.",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1200&auto=format&fit=crop&q=80",
    trendTag: "Gummy Pick",
    titleTag: "Gimme Gummy: Bendy Phone Cases, Jelly Beauty & Rubberized Tech Picks"
  },
  "afrohemian-decor": {
    title: "Afrohemian Decor 🏺",
    description: "Where bohemian texture meets bold African pattern — the home aesthetic blending warmth, color, and craft.",
    editorialText: "Afrohemian Decor brings together the handwoven warmth of bohemian style with the vivid pattern and color of African textile design — think adire-inspired prints, handwoven natural-fiber rugs, and statement wall art that turns a neutral room into something with real personality.",
    whyTrending: "Traditional beige-on-beige minimalism is yielding to expressive craft-driven maximalism. Woven organic jute fibers, earthy clay vessels, and traditional sub-Saharan motifs bring tactile histories into contemporary living spaces. High-contrast patterns against soft linen backdrops make spaces look curated, warm, and highly personalized.",
    image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1200&auto=format&fit=crop&q=80",
    trendTag: "Afrohemian Find",
    titleTag: "Afrohemian Decor: Handwoven Jute Rugs, Tribal Patterns & Boho Clay Picks"
  },
  "doily-era": {
    title: "Doily Era 🧶",
    description: "Lace gets a 2026 glow-up — crochet detailing showing up everywhere from jacket collars to phone cases.",
    editorialText: "The doily is having a moment, and it's not your grandmother's lace. Doily Era takes delicate crochet detail and puts it everywhere — bomber jacket collars, bag charms, even phone cases — proof that 'more is more' can still feel intentional.",
    whyTrending: "Cottagecore has evolved into an intricate, lace-forward maximalism. Intricate yarn-work, openwork crop tops, and delicate crochet collars are replacing basic fast-fashion knitwear. The appeal lies in the handmade, nostalgic feel of lace that communicates slow craft and artistic details.",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&auto=format&fit=crop&q=80",
    trendTag: "Doily Drop",
    titleTag: "Doily Era: Retro Crochet Tops, Delicate Lace Detailing & Knitwear Drops"
  }
};

interface TrendPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TrendPageProps) {
  const { slug } = await params;
  const trend = trendsData[slug];
  if (!trend) return { title: "Trend Not Found — Trendloop" };

  return {
    title: `${trend.titleTag} | Trendloop`,
    description: trend.description,
  };
}

export default async function TrendPage({ params }: TrendPageProps) {
  const { slug } = await params;
  const trend = trendsData[slug];

  if (!trend) {
    notFound();
  }

  // Fetch initial products for this trend
  const { products: initialProducts, totalCount } = await getProducts({
    trendTheme: slug,
    sortBy: "trending",
    limit: 12,
    offset: 0
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-foreground/45 hover:text-foreground text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Discover
        </Link>
      </div>

      {/* Hero Showcase Banner */}
      <section className="relative w-full rounded-3xl overflow-hidden min-h-[380px] flex items-end border border-card-border shadow-md">
        <img
          src={trend.image}
          alt={trend.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Obsidian Gradient Layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
        
        {/* Hero Content Card */}
        <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-2xl text-white space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-white">
            <Sparkles className="w-3 h-3" />
            <span>Pinterest Predicts 2026</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white uppercase leading-none">
            {trend.title}
          </h1>
          
          <p className="text-sm text-gray-200/90 leading-relaxed font-sans max-w-xl">
            {trend.editorialText}
          </p>
        </div>
      </section>

      {/* Grid of Curated Trend Products */}
      <div className="space-y-6 pt-4">
        <div className="flex justify-between items-baseline border-b border-card-border pb-3">
          <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
            Curated {trend.title.replace(/\s*🍬\s*|\s*🏺\s*|\s*🧶\s*/g, "")} Picks
          </h2>
          <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
            {totalCount} Items Found
          </span>
        </div>

        <DiscoverClient 
          initialProducts={initialProducts} 
          initialTotal={totalCount} 
          trendTheme={slug}
        />
      </div>

      {/* Editorial Content / Why This is Trending */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-card-border pt-12">
        <div className="md:col-span-8 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gold">
            Why It's Trending
          </h3>
          <p className="text-sm text-foreground/70 leading-relaxed font-sans">
            {trend.whyTrending}
          </p>
          <p className="text-sm text-foreground/70 leading-relaxed font-sans">
            This curated collection brings together high-converting, premium affiliate picks that match the exact Pinterest visual direction. Every product is evaluated for design authenticity, quality ratings, and vendor reliability before entering the loop.
          </p>
        </div>

        {/* Custom Newsletter Capture */}
        <div className="md:col-span-4 bg-gray-50 dark:bg-zinc-950 p-6 rounded-2xl border border-card-border space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Trend Alert Signup
            </h4>
            <p className="text-[11px] text-foreground/60 leading-relaxed">
              Get notified immediately when new {trend.title.replace(/\s*🍬\s*|\s*🏺\s*|\s*🧶\s*/g, "")} drops and curated links are added to the loop.
            </p>
          </div>
          
          <form className="relative flex items-center mt-2">
            <input
              type="email"
              placeholder="Enter your email..."
              className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
              required
            />
            <button
              type="submit"
              className="absolute right-1 p-2 rounded-lg bg-foreground text-background hover:bg-gold hover:text-white transition-colors"
              aria-label="Subscribe"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
