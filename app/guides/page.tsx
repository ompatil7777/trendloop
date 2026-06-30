import Link from "next/link";
import { getGuides } from "../../lib/data/guides";
import { BookOpen, Calendar, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Aesthetic Buying Guides & Trend Handbooks — Trendloop",
  description: "Read our editorial reviews on modern streetwear, budget room decors, and workspace design to make informed discover purchases.",
};

export default async function GuidesPage() {
  const allGuides = await getGuides();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="space-y-2 border-b border-card-border pb-5">
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground font-display flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-gold" />
          Trend Handbooks
        </h1>
        <p className="text-xs sm:text-sm text-foreground/50 max-w-md leading-relaxed">
          Deep-dives into styling, setup ergonomics, collectibles, and aesthetic selections.
        </p>
      </div>

      {/* Grid of articles */}
      {allGuides.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allGuides.map((guide) => (
            <Link
              key={guide.id}
              href={`/guides/${guide.slug}`}
              className="group flex flex-col bg-card border border-card-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Cover Image */}
              <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100 relative">
                <img
                  src={guide.cover_image}
                  alt={guide.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  Editorial
                </span>
              </div>
              
              {/* Metadata details */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-foreground/40 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(guide.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-foreground group-hover:text-gold transition-colors leading-snug line-clamp-2 uppercase">
                    {guide.title}
                  </h2>
                  <p className="text-xs text-foreground/50 leading-relaxed line-clamp-3">
                    {guide.seo_description}
                  </p>
                </div>
                
                <div className="text-[10px] font-bold text-gold uppercase tracking-widest inline-flex items-center gap-1.5 self-start group-hover:translate-x-1 transition-transform pt-2 border-t border-card-border w-full">
                  <span>Read handbook</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-card-border rounded-3xl">
          <p className="text-foreground/50 text-sm">No handbooks published yet. Stay tuned!</p>
        </div>
      )}

    </div>
  );
}
