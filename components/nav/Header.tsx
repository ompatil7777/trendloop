"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "../../lib/context/AppContext";
import { siteConfig } from "../../config/site";
import { Search, Heart, Globe, Menu, X, Settings, User } from "lucide-react";

export default function Header() {
  const { currency, setCurrency, savedProductIds, user, setShowAuthModal, signOut, addToast } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const toggleCurrency = () => {
    setCurrency(currency === "INR" ? "USD" : "INR");
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-effect border-b border-card-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2">
            <span className="text-xl font-bold tracking-widest text-foreground font-display group-hover:opacity-85 transition-opacity uppercase">
              {siteConfig.name}
            </span>
          </Link>

          {/* DESKTOP CATEGORIES NAV */}
          <nav className="hidden lg:flex items-center gap-6">
            {siteConfig.categories.map((cat) => {
              const href = `/category/${cat.slug}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={cat.slug}
                  href={href}
                  className={`text-xs font-semibold uppercase tracking-wider transition-colors py-1 border-b-2 ${
                    isActive
                      ? "text-gold border-gold"
                      : "text-foreground/60 border-transparent hover:text-foreground hover:border-foreground/20"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
            <Link
              href="/guides"
              className={`text-xs font-semibold uppercase tracking-wider transition-colors py-1 border-b-2 ${
                pathname.startsWith("/guides")
                  ? "text-gold border-gold"
                  : "text-foreground/60 border-transparent hover:text-foreground hover:border-foreground/20"
              }`}
            >
              Guides
            </Link>
          </nav>
        </div>

        {/* CONTROLS / CALL TO ACTIONS */}
        <div className="flex items-center gap-3">
          
          {/* SEARCH TRIGGER */}
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center border border-card-border bg-gray-100 dark:bg-gray-100/5 rounded-full px-3 py-1 animate-slide-up">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search streetwear, setups..."
                className="bg-transparent border-none outline-none text-xs w-36 sm:w-48 text-foreground"
                autoFocus
              />
              <button type="submit" className="text-foreground/65 hover:text-foreground">
                <Search className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} className="ml-2 text-foreground/40 hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-100/10 text-foreground transition-colors"
              aria-label="Search catalog"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
          )}

          {/* CURRENCY TOGGLE */}
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-card-border hover:bg-gray-100 dark:hover:bg-gray-100/10 text-xs font-medium text-foreground transition-colors"
            title={`Switch to ${currency === 'INR' ? 'USD ($)' : 'INR (₹)'}`}
          >
            <Globe className="w-3.5 h-3.5 text-foreground/70" />
            <span className="uppercase font-semibold">{currency}</span>
          </button>

          {/* SAVED ITEMS LINK */}
          <Link
            href="/account/saved"
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-100/10 text-foreground transition-colors"
            aria-label="Saved items"
          >
            <Heart className={`w-4.5 h-4.5 ${savedProductIds.length > 0 ? 'fill-gold text-gold' : ''}`} />
            {savedProductIds.length > 0 && (
              <span className="absolute top-0 right-0 bg-gold text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-background">
                {savedProductIds.length}
              </span>
            )}
          </Link>

          {/* ADMIN SHORTCUT (Visible only to authenticated admins) */}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-100/10 text-foreground transition-colors"
              title="Admin Dashboard"
            >
              <Settings className="w-4.5 h-4.5" />
            </Link>
          )}

          {/* USER PROFILE / AUTHENTICATION BUTTON */}
          {user ? (
            <button
              onClick={() => {
                signOut();
                addToast("Signed out successfully", "info");
              }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-100/10 text-foreground transition-colors"
              title={`Sign Out (${user.username})`}
            >
              <User className="w-4.5 h-4.5 text-gold" />
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-100/10 text-foreground transition-colors"
              title="Sign In / Register"
            >
              <User className="w-4.5 h-4.5" />
            </button>
          )}
          
        </div>
      </div>
    </header>
  );
}
