import { RawProductCandidate, TrendScoreBreakdown } from "./types";

/**
 * Computes an auditable, verifiable Trend Score (0-100) based strictly on ground-truth facts.
 * Hallucinated, estimated, or unmeasured parameters (e.g. social signals, external search volumes)
 * are excluded from the calculation until real data pipelines are established.
 *
 * Formula:
 * 1. Base Rating Score (Max 50 points):
 *    Calculated as: Rating * 10
 *    e.g., a 4.7 rating yields 47 points.
 *
 * 2. Review Volume Bonus (Max 30 points):
 *    Calculated logarithmically to scale naturally from small to large volumes:
 *    reviewScore = min(30, log10(max(1, review_count)) * 8)
 *    - 10 reviews   = ~8.0 points
 *    - 100 reviews  = ~16.0 points
 *    - 1000 reviews = ~24.0 points
 *    - 5600+ reviews = 30.0 points (cap)
 *
 * 3. Popularity & Trust Factor (Max 20 points):
 *    - If rating is >= 4.5 and review_count is >= 100: 20 points
 *    - If rating is >= 4.0 and review_count is >= 50: 15 points
 *    - If rating is >= 3.5: 10 points
 *    - Otherwise: 0 points
 *
 * TODO (Phase 2): Integrate real Google Trends or social media signal API inputs
 * rather than estimating from review counts.
 */
export function calculateTrendScore(candidate: RawProductCandidate): {
  score: number;
  breakdown: TrendScoreBreakdown;
} {
  const rating = candidate.rating ?? 0;
  const reviews = candidate.review_count ?? 0;

  // 1. Base Rating Score
  const baseRatingScore = Math.min(50, rating * 10);

  // 2. Review Volume Bonus
  const reviewVolumeBonus = reviews > 0 
    ? Math.min(30, Math.log10(reviews) * 8) 
    : 0;

  // 3. Popularity Weight
  let popularityWeight = 0;
  if (rating >= 4.5 && reviews >= 100) {
    popularityWeight = 20;
  } else if (rating >= 4.0 && reviews >= 50) {
    popularityWeight = 15;
  } else if (rating >= 3.5) {
    popularityWeight = 10;
  }

  const score = Math.round(baseRatingScore + reviewVolumeBonus + popularityWeight);

  const breakdown: TrendScoreBreakdown = {
    baseRatingScore: parseFloat(baseRatingScore.toFixed(2)),
    reviewVolumeBonus: parseFloat(reviewVolumeBonus.toFixed(2)),
    popularityWeight,
    calculatedAt: new Date().toISOString(),
    formula: "Score = (Rating * 10) + min(30, log10(Reviews) * 8) + TrustBonus",
  };

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown,
  };
}
