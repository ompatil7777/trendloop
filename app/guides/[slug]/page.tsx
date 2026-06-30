import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuideBySlug, getProductsForGuide } from "../../../lib/data/guides";
import ProductCard from "../../../components/feed/ProductCard";
import { ArrowLeft, Calendar, User, Clock, ArrowRight } from "lucide-react";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "Guide Not Found — Trendloop" };

  return {
    title: `${guide.title} — Trendloop Handbook`,
    description: guide.seo_description,
    openGraph: {
      title: guide.title,
      description: guide.seo_description,
      images: [{ url: guide.cover_image }],
      type: "article",
    }
  };
}

// Simple Custom Markdown-to-JSX Renderer
function parseMarkdownToJSX(text: string) {
  const blocks = text.split("\n\n").map((b) => b.trim()).filter(Boolean);

  return blocks.map((block, bIdx) => {
    // 1. Horizontal Rule
    if (block === "---") {
      return <hr key={`hr-${bIdx}`} className="border-card-border my-8" />;
    }

    // 2. Headings
    if (block.startsWith("### ")) {
      return (
        <h4 key={`h4-${bIdx}`} className="text-base sm:text-lg font-black uppercase tracking-tight text-foreground mt-8 mb-4 font-display">
          {block.replace("### ", "")}
        </h4>
      );
    }
    if (block.startsWith("## ")) {
      return (
        <h3 key={`h3-${bIdx}`} className="text-lg sm:text-xl font-black uppercase tracking-tight text-foreground mt-10 mb-5 font-display">
          {block.replace("## ", "")}
        </h3>
      );
    }
    if (block.startsWith("# ")) {
      return (
        <h2 key={`h2-${bIdx}`} className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground mt-12 mb-6 font-display">
          {block.replace("# ", "")}
        </h2>
      );
    }

    // 3. Bullet Lists
    if (block.startsWith("- ")) {
      const items = block.split("\n").map(line => line.replace("- ", "").trim());
      return (
        <ul key={`ul-${bIdx}`} className="list-disc list-inside space-y-2.5 my-4 pl-2 text-xs sm:text-sm text-foreground/75 font-sans leading-relaxed">
          {items.map((it, idx) => (
            <li key={`li-${idx}`} className="marker:text-gold">
              {parseInlineStyles(it)}
            </li>
          ))}
        </ul>
      );
    }

    // 4. Numbered Lists
    if (/^\d+\.\s/.test(block)) {
      const items = block.split("\n").map(line => line.replace(/^\d+\.\s/, "").trim());
      return (
        <ol key={`ol-${bIdx}`} className="list-decimal list-inside space-y-2.5 my-4 pl-2 text-xs sm:text-sm text-foreground/75 font-sans leading-relaxed">
          {items.map((it, idx) => (
            <li key={`ol-li-${idx}`} className="marker:font-bold marker:text-foreground">
              {parseInlineStyles(it)}
            </li>
          ))}
        </ol>
      );
    }

    // 5. Default Paragraph
    return (
      <p key={`p-${bIdx}`} className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans my-4">
        {parseInlineStyles(block)}
      </p>
    );
  });
}

// Helper to replace links [text](url) and bold **text** in text blocks
function parseInlineStyles(text: string) {
  // Regex to extract markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const boldRegex = /\*\*([^*]+)\*\*/g;
  
  let parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Format bold tags first
  let formattedText = text;
  
  // To avoid complex nested regex parsing, we split and build elements sequentially
  // Handle links
  let match;
  let keyCounter = 0;
  
  while ((match = linkRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    
    // Add text preceding the link
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }
    
    const linkText = match[1];
    let linkUrl = match[2];
    
    // Translate file:///product/slug to /product/slug for clean Next.js routing
    if (linkUrl.startsWith("file:///product/")) {
      linkUrl = linkUrl.replace("file:///product/", "/product/");
    }
    
    parts.push(
      <Link 
        key={`link-${keyCounter++}`} 
        href={linkUrl} 
        className="text-gold font-bold hover:underline"
      >
        {linkText}
      </Link>
    );
    
    lastIndex = linkRegex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  // If no links were found, check for simple bold formats
  if (parts.length === 0) {
    return text;
  }
  
  return parts;
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const products = await getProductsForGuide(guide.id);

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <Link
        href="/guides"
        className="inline-flex items-center gap-1.5 text-foreground/45 hover:text-foreground text-xs font-bold uppercase tracking-widest transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Handbooks
      </Link>

      {/* Article Header Metadata */}
      <div className="space-y-4 border-b border-card-border pb-6">
        <span className="text-[10px] font-bold text-gold uppercase tracking-widest">
          Trend Handbook & Editorial
        </span>
        
        <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-foreground font-display leading-tight">
          {guide.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-[10px] text-foreground/40 font-bold uppercase tracking-widest pt-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date(guide.published_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>Trendloop Editors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>4 Min Read</span>
          </div>
        </div>
      </div>

      {/* Large Featured Image */}
      <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100 rounded-3xl border border-card-border shadow-sm">
        <img
          src={guide.cover_image}
          alt={guide.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main text body */}
      <div className="prose prose-neutral dark:prose-invert max-w-none pt-4">
        {parseMarkdownToJSX(guide.body_markdown)}
      </div>

      {/* Featured Products Mentioned in Article */}
      {products.length > 0 && (
        <section className="border-t border-card-border pt-12 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-black uppercase tracking-widest text-foreground font-display">
              Mentioned in this article
            </h3>
            <p className="text-xs text-foreground/40">
              Discovered and reviewed products featured above.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={`guide-prod-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      )}

    </article>
  );
}
