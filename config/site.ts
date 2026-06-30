export interface CurrencyConfig {
  code: 'INR' | 'USD';
  symbol: string;
  rateToINR: number; // For conversions if needed later
}

export const siteConfig = {
  name: "Trendloop",
  tagline: "Discover the Vibe. Shop the Look.",
  description: "The premium discovery platform for Gen-Z trends, streetwear, gaming setups, and room aesthetics. Products are content, not inventory.",
  
  // Currency Configuration (USD / INR toggle)
  // Set default to 'INR' as requested for launch, but fully customizable.
  activeCurrency: 'INR' as 'INR' | 'USD',
  
  currencies: {
    INR: {
      code: 'INR' as const,
      symbol: '₹',
      rateToINR: 1,
    },
    USD: {
      code: 'USD' as const,
      symbol: '$',
      rateToINR: 83.5, // Reference exchange rate for mock data conversions
    }
  },
  
  featureFlags: {
    ENABLE_BACKEND: false, // Set to false for Phase 1 (mock data)
    ENABLE_NEWSLETTER: true,
    ENABLE_PERSONALIZATION: false, // Phase 2+ feature
  },
  
  socialLinks: {
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    pinterest: "https://pinterest.com",
    youtube: "https://youtube.com",
  },

  contactEmail: "hello@trendloop.com",
  
  // Category list used to generate rails and navigation
  categories: [
    { slug: "streetwear", name: "Streetwear", description: "Oversized fits, sneakers, and hype pieces." },
    { slug: "gaming-setup", name: "Gaming Setup", description: "Minimalist desk setups, mechanical keyboards, and ambient light." },
    { slug: "anime-aesthetics", name: "Anime Aesthetics", description: "Collectibles, anime-inspired apparel, and wall art." },
    { slug: "room-decor", name: "Room Decor", description: "Sunset lamps, vines, floating shelves, and cozy vibes." },
    { slug: "fitness", name: "Fitness & Athleisure", description: "Premium pump covers, gym gear, and sleek water bottles." }
  ]
};

export type SiteConfig = typeof siteConfig;
