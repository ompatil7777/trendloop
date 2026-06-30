import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Affiliate Disclosure — Trendloop",
  description: "Transparency statement regarding out-bound product links and partnerships.",
};

export default function AffiliateDisclosurePage() {
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
        <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Legal Transparency Statement</span>
        <h1 className="text-2xl sm:text-4xl font-extrabold uppercase text-foreground font-display leading-tight">
          Affiliate Disclosure
        </h1>
        <p className="text-xs text-foreground/40 font-medium">Last updated: June 2026</p>
      </div>

      <div className="space-y-5 text-xs sm:text-sm leading-relaxed">
        <p>
          Welcome to <strong>Trendloop</strong>. We believe in absolute transparency and want to build a community founded on mutual trust. In compliance with the Federal Trade Commission (FTC) guidelines (and local regulatory frameworks), this disclosure explains our business model.
        </p>

        <h2 className="text-sm sm:text-base font-black uppercase text-foreground font-display pt-4">
          How We Fund Trendloop
        </h2>
        <p>
          Trendloop is a Gen-Z trends and aesthetic product discovery platform. We are <strong>not a storefront</strong>: we do not stock inventory, process transactions, manage warehouses, or handle product returns.
        </p>
        <p>
          Instead, we curate items, style them in layouts, and write design handbooks. When you discover a product you like, clicking the "Buy Now" CTA directs you off-platform to the official merchant site (such as Amazon, Flipkart, Myntra, Nike, or Keychron).
        </p>
        <p>
          These outbound links are <strong>affiliate links</strong>. If you make a purchase after clicking through our site, the merchant pays us a small commission for referring you.
        </p>

        <h2 className="text-sm sm:text-base font-black uppercase text-foreground font-display pt-4">
          Impact on Our Curations & Recommendations
        </h2>
        <p>
          We recommend products solely based on their design credentials, aesthetic appeal, community ratings, and value for money. 
        </p>
        <ul className="list-disc list-inside space-y-2 pl-2">
          <li><strong>No Added Cost to You:</strong> The commission we receive is paid entirely by the retailer. The item price is exactly the same whether you use our link or search for it directly on the merchant's site.</li>
          <li><strong>Editorial Independence:</strong> Brands do not pay us to rate items positively. If an item is sponsored, we explicitly label it as "Sponsored Placement" or "Partner Brand" directly on the product card.</li>
          <li><strong>Fair Assessments:</strong> Our pros/cons and product details highlight flaws (e.g. "Suede gets ruined in the rain" or "Wool felt is scratchy for sensitive skin") to ensure you make informed decisions.</li>
        </ul>

        <h2 className="text-sm sm:text-base font-black uppercase text-foreground font-display pt-4">
          Amazon Associates & Network Disclosures
        </h2>
        <p>
          Trendloop is a participant in the Amazon Services LLC Associates Program and the Amazon EU Associates Programme, affiliate advertising programs designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.
        </p>
        <p>
          If you have any questions regarding this disclosure or our curation choices, please reach out to us at <a href="mailto:hello@trendloop.com" className="text-gold font-bold hover:underline">hello@trendloop.com</a>.
        </p>
      </div>

    </div>
  );
}
