import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Trendloop",
  description: "Learn how we handle cookies, session tracking, and user account data.",
};

export default function PrivacyPage() {
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
        <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Privacy Standards</span>
        <h1 className="text-2xl sm:text-4xl font-extrabold uppercase text-foreground font-display leading-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-foreground/40 font-medium">Last updated: June 2026</p>
      </div>

      <div className="space-y-5 text-xs sm:text-sm leading-relaxed">
        <p>
          At Trendloop, accessible from <Link href="/" className="text-gold font-bold hover:underline">trendloop.com</Link>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Trendloop and how we use it.
        </p>

        <h2 className="text-sm sm:text-base font-black uppercase text-foreground font-display pt-4">
          Information We Collect
        </h2>
        <p>
          We collect minimal personal data to run the trend discovery services:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-2">
          <li><strong>Account Data:</strong> If you sign up, we store your email, username, bio, and custom board collections.</li>
          <li><strong>Activity Logs:</strong> When you click a redirection link, we log the product id, target retailer, time, and optional UTM parameters.</li>
          <li><strong>Cookies & Web Beacons:</strong> We use analytical cookies (via Google Analytics and PostHog) to understand which layouts and items are most popular.</li>
        </ul>

        <h2 className="text-sm sm:text-base font-black uppercase text-foreground font-display pt-4">
          How We Use Your Information
        </h2>
        <p>
          We use the information we collect to maintain and optimize Trendloop:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-2">
          <li>Provide and improve the masonry grids, search filters, and personalization rails.</li>
          <li>Measure click-through rates on outbound links to compile trending scores and calculate estimated revenue.</li>
          <li>Send weekly newsletter emails to subscribed users.</li>
        </ul>

        <p>
          If you have any questions or require more information about our Privacy Policy, do not hesitate to contact us at <a href="mailto:hello@trendloop.com" className="text-gold font-bold hover:underline">hello@trendloop.com</a>.
        </p>
      </div>

    </div>
  );
}
