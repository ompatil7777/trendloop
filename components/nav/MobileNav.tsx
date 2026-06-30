"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../../lib/context/AppContext";
import { Home, Compass, Search, Heart, User } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const { savedProductIds } = useApp();

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home
    },
    {
      label: "Discover",
      href: "/discover",
      icon: Compass
    },
    {
      label: "Search",
      href: "/search",
      icon: Search
    },
    {
      label: "Saved",
      href: "/account/saved",
      icon: Heart,
      badge: savedProductIds.length > 0 ? savedProductIds.length : undefined
    },
    {
      label: "Profile",
      href: "/account",
      icon: User
    }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 glass-effect border-t border-card-border flex items-center justify-around px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.label}
            href={item.href}
            className="relative flex flex-col items-center justify-center w-12 h-12 text-foreground/50 hover:text-foreground transition-colors"
          >
            <Icon 
              className={`w-5 h-5 transition-transform duration-200 ${
                isActive ? "text-gold scale-110 fill-gold/10" : "hover:scale-105"
              }`} 
            />
            <span 
              className={`text-[9px] mt-1 font-medium tracking-wide transition-colors ${
                isActive ? "text-gold font-bold" : "text-foreground/50"
              }`}
            >
              {item.label}
            </span>
            {item.badge !== undefined && (
              <span className="absolute top-1 right-2 bg-gold text-white text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-background">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
