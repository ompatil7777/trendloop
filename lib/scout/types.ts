export interface SearchFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  minReviews?: number;
  minTrendScore?: number;
}

export interface RawProductCandidate {
  source_url: string;          // required, never empty
  source_name: string;         // e.g. "amazon", "nike", "keychron", "duckduckgo"
  title: string;
  price: number | null;
  rating: number | null;
  review_count: number | null;
  image_urls: string[];
  retrieved_at: string;        // ISO timestamp
  raw_snippet: string | null;  // raw text page snippet for audit checks
}

export interface ResearchProvider {
  search(query: string, filters: SearchFilters): Promise<RawProductCandidate[]>;
}

export interface TrendScoreBreakdown {
  baseRatingScore: number;
  reviewVolumeBonus: number;
  popularityWeight: number;
  calculatedAt: string;
  formula: string;
}
