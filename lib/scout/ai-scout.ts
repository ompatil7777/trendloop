import { createAdminClient } from "../supabase/server";
import { RawProductCandidate, SearchFilters, TrendScoreBreakdown } from "./types";
import { selectProvider } from "./search-provider";
import { calculateTrendScore } from "./trend-evaluator";

interface FactCheckResult {
  passed: boolean;
  mismatches: { field: string; generated: string; expected: string }[];
}

/**
 * Heuristically parses generated texts to check if the AI hallucinates numeric attributes.
 * Compares claims in generated copy against candidate ground-truth parameters.
 */
export function factCheckGeneratedContent(
  candidate: RawProductCandidate,
  generated: { name: string; short_description: string; long_description: string; meta_description: string; price: number }
): FactCheckResult {
  const mismatches: FactCheckResult["mismatches"] = [];
  const allText = `${generated.name} ${generated.short_description} ${generated.long_description} ${generated.meta_description}`;

  // Clean the text to remove denominators "out of 5" and "/5" to prevent false positive ratings
  const textForRatings = allText.replace(/out of 5/gi, "").replace(/\/5/g, "");

  // Clean the text to remove decimals to prevent decimal parts from matching as review counts
  const textForReviews = allText.replace(/\d+\.\d+/g, "");

  // 1. Validate Ratings claims
  const ratingClaims = textForRatings.match(/(\d(\.\d)?)\s*(stars?|rating)/gi) ?? [];
  for (const claim of ratingClaims) {
    const num = parseFloat(claim);
    if (candidate.rating === null) {
      mismatches.push({ field: "rating", generated: claim, expected: "null (unverified)" });
    } else if (Math.abs(num - candidate.rating) > 0.1) {
      mismatches.push({ field: "rating", generated: claim, expected: String(candidate.rating) });
    }
  }

  // 2. Validate Review count claims
  const reviewClaims = textForReviews.match(/(\d+)\s*(reviews?|ratings?)/gi) ?? [];
  for (const claim of reviewClaims) {
    const num = parseInt(claim.replace(/[^\d]/g, ""), 10);
    if (candidate.review_count === null) {
      mismatches.push({ field: "review_count", generated: claim, expected: "null (unverified)" });
    } else if (num !== candidate.review_count && Math.abs(num - candidate.review_count) > (candidate.review_count * 0.05)) {
      mismatches.push({ field: "review_count", generated: claim, expected: String(candidate.review_count) });
    }
  }

  // 3. Validate Price claims (both INR and USD notation)
  const priceClaims = allText.match(/[₹$]\s?[\d,]+(\.\d{2})?/g) ?? [];
  for (const claim of priceClaims) {
    const num = parseFloat(claim.replace(/[^\d.]/g, ""));
    const basePrice = candidate.price ?? 0;
    const usdPrice = basePrice / 83.5;
    
    // Check if the price claim matches either base price (INR) or converted price (USD)
    const matchesBase = basePrice > 0 && Math.abs(num - basePrice) < 5;
    const matchesUsd = basePrice > 0 && Math.abs(num - usdPrice) < 2;

    if (!matchesBase && !matchesUsd) {
      mismatches.push({
        field: "price",
        generated: claim,
        expected: `INR ${basePrice} (or approx USD ${usdPrice.toFixed(2)})`,
      });
    }
  }

  // Validate the generated schema price matches expected candidate price
  if (candidate.price !== null && generated.price !== null && Math.abs(generated.price - candidate.price) > 0.01) {
    mismatches.push({
      field: "price_schema",
      generated: String(generated.price),
      expected: String(candidate.price),
    });
  }

  return { passed: mismatches.length === 0, mismatches };
}

/**
 * Queries Gemini API via raw REST fetch to generate structured product catalog specs.
 */
async function generateListingWithGemini(
  candidate: RawProductCandidate,
  correctionsPrompt = ""
): Promise<any> {
  const allowMock = process.env.SCOUT_USE_MOCK === "true" && process.env.NODE_ENV !== "production";

  if (allowMock && (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.startsWith("your-") || process.env.GEMINI_API_KEY === "")) {
    console.log(`[AI Scout] Mocking Gemini listing generation for "${candidate.title}"`);
    const cleanTitle = candidate.title.replace(/mock/gi, "").trim();
    
    // Estimate category and subcategory based on title
    let category = "Gaming Setup";
    let subcategory = "keyboards";
    let tags = ["Minimal", "Setup"];
    
    const lowerTitle = candidate.title.toLowerCase();
    if (lowerTitle.includes("sneaker") || lowerTitle.includes("hoodie") || lowerTitle.includes("nike") || lowerTitle.includes("streetwear")) {
      category = "Streetwear";
      subcategory = lowerTitle.includes("hoodie") ? "hoodies" : "sneakers";
      tags = ["Streetwear", "Comfort", "Aesthetic"];
    } else if (lowerTitle.includes("keyboard") || lowerTitle.includes("switch") || lowerTitle.includes("keycap")) {
      category = "Gaming Setup";
      subcategory = "keyboards";
      tags = ["Mechanical", "Desk Setup", "Keyboards"];
    } else if (lowerTitle.includes("felt") || lowerTitle.includes("mat") || lowerTitle.includes("pad")) {
      category = "Gaming Setup";
      subcategory = "desk-mats";
      tags = ["Desk Pad", "Merino Wool", "Desk Setup"];
    } else if (lowerTitle.includes("lamp") || lowerTitle.includes("light") || lowerTitle.includes("ambient")) {
      category = "Room Decor";
      subcategory = "ambient-lighting";
      tags = ["Cozy", "Sunset Lamp", "Ambient"];
    }

    return {
      name: cleanTitle,
      seo_title: `${cleanTitle} — Curated Gen-Z Trendloop Curation`,
      short_description: `Super premium ${cleanTitle.toLowerCase()} that is trending all over social media.`,
      long_description: `We curated the ${cleanTitle} specifically for its outstanding aesthetics, premium build quality, and value. Fits perfectly into the modern Gen-Z style.`,
      features: [
        "Highly requested aesthetic look",
        "Excellent quality materials",
        "Top-rated user reviews and feedback"
      ],
      category: category,
      subcategory: subcategory,
      tags: tags,
      price: candidate.price ?? 2999,
      suggested_keywords: [cleanTitle.toLowerCase(), "trendloop", "curated style"],
      meta_description: `Our full hands-on review and curation of the ${cleanTitle}. See why it's trending.`,
      trending_labels: ["Editor's Pick", "Highly Rated"]
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not configured");

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const basePrompt = `
You are a Gen-Z trend discovery copywriter curating products for Trendloop.
Generate a premium, detailed product catalog draft listing based strictly on this fetched candidate data:

Product Title: ${candidate.title}
Source Link: ${candidate.source_url}
Ground Truth Price: ${candidate.price ?? "unknown"}
Ground Truth Rating: ${candidate.rating ?? "unknown"}
Ground Truth Reviews: ${candidate.review_count ?? "unknown"}
Raw page snippet info: ${candidate.raw_snippet ?? ""}

GEN-Z BRAND STYLE & TONAL GUIDELINES:
- Tonal Profile: Premium, streetwear-focused, cozy workspace aesthetic. Think high-end, clean, and aspirational.
- Descriptions should feel curated, review-centric, and visual.
- List distinct features in 'features'.
- Automatically determine category (exactly one of: Streetwear, Gaming Setup, Anime Aesthetics, Room Decor, Fitness) and subcategory.
- Generate relevant search keywords and metadata.

FACT-CHECKING RULES:
- Do NOT hallucinate or state incorrect ratings/reviews. If rating is unknown, do not write "4.5 stars" or "500 reviews".
- Ground truth price is ${candidate.price ?? "unknown"}. Do not invent another price.
${correctionsPrompt}
`;

  const payload = {
    contents: [{ parts: [{ text: basePrompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          seo_title: { type: "STRING" },
          short_description: { type: "STRING" },
          long_description: { type: "STRING" },
          features: { type: "ARRAY", items: { type: "STRING" } },
          category: { type: "STRING" },
          subcategory: { type: "STRING" },
          tags: { type: "ARRAY", items: { type: "STRING" } },
          price: { type: "NUMBER" },
          suggested_keywords: { type: "ARRAY", items: { type: "STRING" } },
          meta_description: { type: "STRING" },
          trending_labels: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["name", "short_description", "long_description", "category", "tags", "price"],
      },
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API call failed with status ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) throw new Error("Gemini API returned an empty completion content");

  return JSON.parse(textContent);
}

/**
 * Fallback to strip incorrect numeric claims from generated listings using Gemini.
 */
async function stripUnverifiableNumericClaims(generated: any, mismatches: any[]): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return generated;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const prompt = `
Take the following JSON product listing:
${JSON.stringify(generated)}

We identified these unverified numeric/rating mismatches in the descriptions:
${JSON.stringify(mismatches)}

Remove all mentions of those unverified numbers, ratings, or prices in the 'short_description', 'long_description', and 'meta_description'. Replace them with general aesthetic descriptions (e.g. "highly rated", "premium tier", "cozy pricing").
Return the updated JSON.
`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return JSON.parse(text);
    }
  } catch (err) {
    console.error("Error during claim stripping fallback:", err);
  }

  return generated;
}

/**
 * Runs a product scout curation job, performing queries, filtering quality thresholds,
 * score calculations, fact-checking, and inserting drafts.
 */
export async function runScoutJob(jobId: string, adminId: string, query: string, filters: SearchFilters) {
  const supabase = createAdminClient();
  const importErrors: any[] = [];
  let candidatesFound = 0;
  let candidatesPassed = 0;
  let draftsCreated = 0;

  try {
    // 1. Mark job as running
    await supabase
      .from("research_jobs")
      .update({ status: "running" })
      .eq("id", jobId);

    // 2. Sourcing Candidates
    const provider = selectProvider();
    let candidates: RawProductCandidate[] = [];

    try {
      candidates = await provider.search(query, filters);
      candidatesFound = candidates.length;

      if (candidatesFound === 0) {
        throw new Error("No real candidates found — provider returned empty result set");
      }
    } catch (err: any) {
      console.error("Research Sourcing Error:", err);
      await supabase
        .from("research_jobs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: `Research provider failed: ${err.message}`,
        })
        .eq("id", jobId);
      return;
    }

    // 3. Process each Candidate
    for (const cand of candidates) {
      try {
        // Apply Quality Filters
        const rating = cand.rating ?? 0;
        const reviews = cand.review_count ?? 0;
        const { score: trendScore, breakdown: scoreBreakdown } = calculateTrendScore(cand);

        const passesMinRating = filters.minRating ? rating >= filters.minRating : true;
        const passesMinReviews = filters.minReviews ? reviews >= filters.minReviews : true;
        const passesMinTrend = filters.minTrendScore ? trendScore >= filters.minTrendScore : true;

        if (!passesMinRating || !passesMinReviews || !passesMinTrend) {
          console.log(`[AI Scout] Candidate skipped due to quality filters. URL: ${cand.source_url}`);
          continue;
        }

        candidatesPassed++;

        // Save Raw Candidate in database
        const { data: dbCand, error: candErr } = await supabase
          .from("product_candidates")
          .insert({
            research_job_id: jobId,
            source_url: cand.source_url,
            source_name: cand.source_name,
            title: cand.title,
            price: cand.price,
            rating: cand.rating,
            review_count: cand.review_count,
            image_urls_json: cand.image_urls,
            raw_snippet: cand.raw_snippet,
          })
          .select("id")
          .single();

        if (candErr || !dbCand) {
          throw new Error(`Failed to save product candidate: ${candErr?.message}`);
        }

        // 4. Generate Curation Listing with AI
        let generated: any = null;
        let dataConfidence: "verified" | "partial" | "unverified" = "verified";

        // Mark partial if ratings or price are missing on source
        if (cand.rating === null || cand.price === null) {
          dataConfidence = "partial";
        }

        try {
          generated = await generateListingWithGemini(cand);

          // 5. Fact Check AI copy
          const factCheck = factCheckGeneratedContent(cand, generated);
          if (!factCheck.passed) {
            console.log(`[AI Scout Warning] Fact check failed for candidate. Retrying with corrections. Mismatches:`, factCheck.mismatches);
            
            const correctionsPrompt = `
We identified these factual mismatches in your previous response. Please correct them exactly:
${JSON.stringify(factCheck.mismatches)}
`;
            try {
              generated = await generateListingWithGemini(cand, correctionsPrompt);
              const recheck = factCheckGeneratedContent(cand, generated);

              if (!recheck.passed) {
                console.log(`[AI Scout Warning] Second fact check pass failed. Stripping unverifiable claims.`);
                generated = await stripUnverifiableNumericClaims(generated, recheck.mismatches);
                dataConfidence = "partial";
              }
            } catch (retryErr) {
              console.error("AI correction retry failed:", retryErr);
              dataConfidence = "partial";
            }
          }
        } catch (genErr: any) {
          console.error(`AI Curation Curation Error for URL ${cand.source_url}:`, genErr);
          importErrors.push({ url: cand.source_url, phase: "gemini_generation", error: genErr.message });
          continue;
        }

        // 6. Write Draft Product record (AI must NEVER write status = 'published')
        const { error: draftErr } = await supabase
          .from("draft_products")
          .insert({
            research_job_id: jobId,
            product_candidate_id: dbCand.id,
            name: generated.name || cand.title,
            seo_title: generated.seo_title || generated.name,
            short_description: generated.short_description || "",
            long_description: generated.long_description || "",
            features_json: generated.features || [],
            category: generated.category || filters.category || "Lifestyle",
            subcategory: generated.subcategory || "",
            tags_json: generated.tags || [],
            price: cand.price ?? generated.price ?? 0,
            suggested_keywords_json: generated.suggested_keywords || [],
            meta_description: generated.meta_description || "",
            trend_score: trendScore,
            trend_score_breakdown_json: scoreBreakdown,
            data_confidence: dataConfidence,
            status: "draft", // structural constraint: drafts always start as draft
          });

        if (draftErr) {
          throw new Error(`Failed to insert draft product: ${draftErr.message}`);
        }

        draftsCreated++;
      } catch (err: any) {
        console.error(`Error processing candidate ${cand.source_url}:`, err);
        importErrors.push({ url: cand.source_url, phase: "candidate_loop", error: err.message });
      }
    }

    // 7. Write Import logs and close job
    await supabase
      .from("import_logs")
      .insert({
        research_job_id: jobId,
        candidates_found: candidatesFound,
        candidates_passed_filters: candidatesPassed,
        drafts_created: draftsCreated,
        errors_json: importErrors,
      });

    await supabase
      .from("research_jobs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    console.log(`[AI Scout] Job completed. Drafts created: ${draftsCreated}/${candidatesFound}`);

  } catch (err: any) {
    console.error("AI Scout Job Crash:", err);
    await supabase
      .from("research_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: `AI Scout run crashed: ${err.message}`,
      })
      .eq("id", jobId);
  }
}
