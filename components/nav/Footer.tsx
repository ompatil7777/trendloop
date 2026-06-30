"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "../../config/site";
import { Heart } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-card border-t border-card-border py-8 mt-16 font-sans text-foreground/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-sm font-bold tracking-widest text-foreground font-display uppercase">
            {siteConfig.name}
          </span>
          <span className="text-[10px] tracking-wide text-foreground/40 font-medium">
            {siteConfig.tagline}
          </span>
        </div>

        {/* Links Rail */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-wider">
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/affiliate-disclosure" className="text-gold hover:text-gold-hover hover:underline transition-all">
            Affiliate Disclosure
          </Link>
        </nav>

        {/* Copyright details */}
        <div className="flex flex-col items-center md:items-end gap-1 text-[10px] text-foreground/35">
          <span>&copy; {currentYear} {siteConfig.name} Inc. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-gold fill-gold" /> for Gen-Z trend discovery.
          </span>
        </div>

      </div>
    </footer>
  );
}
