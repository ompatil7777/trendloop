import { ResearchProvider, RawProductCandidate, SearchFilters } from "./types";

/**
 * Parses page HTML looking for standard Open Graph tags or schema.org JSON-LD metadata.
 * Returns parsed attributes if found, otherwise nulls.
 */
function parseProductMetadata(html: string, url: string): Partial<RawProductCandidate> {
  const result: Partial<RawProductCandidate> = {
    title: "",
    price: null,
    rating: null,
    review_count: null,
    image_urls: [],
    raw_snippet: null,
  };

  try {
    // 1. Extract Open Graph Title
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                       html.match(/<meta\s+name="title"\s+content="([^"]+)"/i);
    if (titleMatch) {
      result.title = titleMatch[1];
    } else {
      const tagTitleMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (tagTitleMatch) result.title = tagTitleMatch[1].trim();
    }

    // 2. Extract Open Graph Image
    const imgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (imgMatch) {
      result.image_urls = [imgMatch[1]];
    }

    // 3. Extract JSON-LD script blocks (very common for modern e-commerce sites)
    const jsonLdRegex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        const graphs = Array.isArray(parsed) ? parsed : (parsed["@graph"] ? parsed["@graph"] : [parsed]);

        for (const node of graphs) {
          if (node["@type"] === "Product" || node["@type"]?.includes("Product")) {
            // Price extraction
            if (node.offers) {
              const offer = Array.isArray(node.offers) ? node.offers[0] : node.offers;
              if (offer.price) {
                const parsedPrice = parseFloat(String(offer.price).replace(/[^\d.]/g, ""));
                if (!isNaN(parsedPrice)) result.price = parsedPrice;
              }
            }
            // Rating value extraction
            if (node.aggregateRating) {
              const rating = parseFloat(String(node.aggregateRating.ratingValue));
              const count = parseInt(String(node.aggregateRating.reviewCount || node.aggregateRating.ratingCount), 10);
              if (!isNaN(rating)) result.rating = rating;
              if (!isNaN(count)) result.review_count = count;
            }
            break;
          }
        }
      } catch {
        // Skip malformed script tags
      }
    }

    // 4. Fallback scraping regexes for major sites if metadata is missing
    if (url.includes("amazon")) {
      // Rating: e.g. "4.5 out of 5 stars"
      const amzRatingMatch = html.match(/class="a-icon-alt">([^<]+out of 5 stars[^<]*)</i) ||
                             html.match(/(\d\.\d)\s*out of 5 stars/i);
      if (amzRatingMatch && !result.rating) {
        const r = parseFloat(amzRatingMatch[1]);
        if (!isNaN(r)) result.rating = r;
      }
      // Review count: e.g. "1,245 ratings"
      const amzReviewMatch = html.match(/id="acrCustomerReviewText"[^>]*>([\d,]+)\s*(ratings|reviews)/i);
      if (amzReviewMatch && !result.review_count) {
        const rc = parseInt(amzReviewMatch[1].replace(/,/g, ""), 10);
        if (!isNaN(rc)) result.review_count = rc;
      }
      // Price: e.g. class="a-price-whole"
      const amzPriceMatch = html.match(/class="a-price-whole">([\d,]+)/i);
      if (amzPriceMatch && !result.price) {
        const p = parseFloat(amzPriceMatch[1].replace(/,/g, ""));
        if (!isNaN(p)) result.price = p;
      }
    }

    // Save a small snippet for auditing and validation checks
    result.raw_snippet = html.substring(0, 1000);
  } catch (err) {
    console.error("Error parsing candidate product HTML:", err);
  }

  return result;
}

/**
 * 1. Tavily Search API Research Provider
 */
export class TavilyResearchProvider implements ResearchProvider {
  async search(query: string, filters: SearchFilters): Promise<RawProductCandidate[]> {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) throw new Error("Tavily API key is missing");

    const categoryQuery = filters.category ? ` in category ${filters.category}` : "";
    const fullQuery = `buy online product ${query}${categoryQuery}`;

    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: fullQuery,
        search_depth: "advanced",
        include_raw_content: false,
        max_results: 10,
      }),
    });

    if (!res.ok) {
      throw new Error(`Tavily search API failed: status ${res.status}`);
    }

    const data = await res.json();
    const candidates: RawProductCandidate[] = [];

    for (const item of (data.results || [])) {
      try {
        // Fetch and parse details to get ratings/prices
        const pDetails = await fetchProductPageDetails(item.url);
        candidates.push({
          source_url: item.url,
          source_name: "tavily",
          title: pDetails.title || item.title || "Unknown Product",
          price: pDetails.price ?? null,
          rating: pDetails.rating ?? null,
          review_count: pDetails.review_count ?? null,
          image_urls: pDetails.image_urls && pDetails.image_urls.length > 0 ? pDetails.image_urls : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
          retrieved_at: new Date().toISOString(),
          raw_snippet: pDetails.raw_snippet || item.content || "",
        });
      } catch (err) {
        console.warn(`Error resolving details for ${item.url}:`, err);
      }
    }

    return candidates;
  }
}

/**
 * 2. Serper Search API Research Provider
 */
export class SerperResearchProvider implements ResearchProvider {
  async search(query: string, filters: SearchFilters): Promise<RawProductCandidate[]> {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) throw new Error("Serper API key is missing");

    const categoryQuery = filters.category ? ` ${filters.category}` : "";
    const fullQuery = `${query}${categoryQuery} buy online`;

    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: fullQuery,
        num: 10,
      }),
    });

    if (!res.ok) {
      throw new Error(`Serper search API failed: status ${res.status}`);
    }

    const data = await res.json();
    const candidates: RawProductCandidate[] = [];

    for (const item of (data.organic || [])) {
      try {
        const pDetails = await fetchProductPageDetails(item.link);
        candidates.push({
          source_url: item.link,
          source_name: "serper",
          title: pDetails.title || item.title || "Unknown Product",
          price: pDetails.price ?? null,
          rating: pDetails.rating ?? null,
          review_count: pDetails.review_count ?? null,
          image_urls: pDetails.image_urls && pDetails.image_urls.length > 0 ? pDetails.image_urls : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
          retrieved_at: new Date().toISOString(),
          raw_snippet: pDetails.raw_snippet || item.snippet || "",
        });
      } catch (err) {
        console.warn(`Error resolving Serper detail link ${item.link}:`, err);
      }
    }

    return candidates;
  }
}

/**
 * 3. DuckDuckGo Scraper Research Provider (Temporary dev-only fallback)
 *
 * TEMPORARY PROVIDER — DO NOT TREAT AS PRODUCTION-GRADE.
 *
 * Scrapes DuckDuckGo's HTML search results page. This is not an
 * officially supported API and WILL break when DDG changes markup,
 * with no advance warning.
 *
 * Replace with TavilyResearchProvider or SerperResearchProvider
 * (both have free tiers) before relying on this system for real
 * product decisions. Keep this only as a zero-cost dev fallback.
 *
 * TODO(owner): remove or demote to dev-only once a real search API
 * key is configured.
 */
export class DuckDuckGoResearchProvider implements ResearchProvider {
  async search(query: string, filters: SearchFilters): Promise<RawProductCandidate[]> {
    // Log runtime warning when serving outside local development
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[AI Scout Warning] DuckDuckGoResearchProvider scraper active in non-dev environment. Sourcing could break silently."
      );
    }

    const queryStr = `${query}${filters.category ? ' ' + filters.category : ''} online store`;
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(queryStr)}`;

    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html",
      },
    });

    if (!res.ok) {
      throw new Error(`DuckDuckGo scraper search failed with HTTP status: ${res.status}`);
    }

    const html = await res.text();
    const urls: string[] = [];

    // Parse links from duckduckgo html page
    const linkRegex = /<a class="result__url"[^>]*href="([^"]+)"/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null && urls.length < 8) {
      const fullUrl = match[1];
      if (fullUrl.includes("uddg=")) {
        try {
          const parts = new URL(fullUrl).searchParams;
          const actualUrl = parts.get("uddg");
          if (actualUrl && !actualUrl.includes("duckduckgo.com")) {
            urls.push(actualUrl);
          }
        } catch {
          urls.push(fullUrl);
        }
      } else if (!fullUrl.includes("duckduckgo.com")) {
        urls.push(fullUrl);
      }
    }

    const candidates: RawProductCandidate[] = [];
    for (const url of urls) {
      try {
        const pDetails = await fetchProductPageDetails(url);
        candidates.push({
          source_url: url,
          source_name: "duckduckgo_scrape",
          title: pDetails.title || "Scraped Online Product",
          price: pDetails.price ?? null,
          rating: pDetails.rating ?? null,
          review_count: pDetails.review_count ?? null,
          image_urls: pDetails.image_urls && pDetails.image_urls.length > 0 ? pDetails.image_urls : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
          retrieved_at: new Date().toISOString(),
          raw_snippet: pDetails.raw_snippet || "DuckDuckGo search result",
        });
      } catch (err) {
        console.warn(`Error resolving details during scrape for ${url}:`, err);
      }
    }

    return candidates;
  }
}

/**
 * 4. Mock Curation Research Provider (Sandbox Curation queries)
 * Gated behind SCOUT_USE_MOCK config in environment.
 */
export class MockResearchProvider implements ResearchProvider {
  async search(query: string, filters: SearchFilters): Promise<RawProductCandidate[]> {
    console.log(`[AI Scout] Using MockResearchProvider for query "${query}"`);
    const q = query.toLowerCase();

    const allMocks: RawProductCandidate[] = [
      {
        source_url: "https://www.amazon.in/dp/B08L8D1H85",
        source_name: "mock_amazon",
        title: "Retro Mechanical RGB Keyboard - Wood Finish Edition",
        price: 4999,
        rating: 4.6,
        review_count: 1450,
        image_urls: ["https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600"],
        retrieved_at: new Date().toISOString(),
        raw_snippet: "Plausible keyboard specs from mock amazon page",
      },
      {
        source_url: "https://www.nike.com/in/t/air-max-scout-mock",
        source_name: "mock_nike",
        title: "Nike Air Max Streetwear Vibe Sneakers",
        price: 9999,
        rating: 4.8,
        review_count: 512,
        image_urls: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
        retrieved_at: new Date().toISOString(),
        raw_snippet: "Nike sneaker mock description page text",
      },
      {
        source_url: "https://keychron.in/products/k2-mock",
        source_name: "mock_keychron",
        title: "Keychron K2 V2 Wireless Mechanical Keyboard",
        price: 7499,
        rating: 4.7,
        review_count: 220,
        image_urls: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600"],
        retrieved_at: new Date().toISOString(),
        raw_snippet: "Keychron mechanical keyboard overview",
      },
      {
        source_url: "https://www.amazon.in/dp/B09M8H25V8",
        source_name: "mock_sunset_lamp",
        title: "Sunset Projection Lamp v3",
        price: 890,
        rating: 4.3,
        review_count: 120,
        image_urls: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600"],
        retrieved_at: new Date().toISOString(),
        raw_snippet: "Sunset lamp projection details and rotating head features",
      }
    ];

    // Filter mock results based on query keywords
    if (q.includes("keyboard") || q.includes("keycap") || q.includes("switch")) {
      return allMocks.filter(m => m.title.toLowerCase().includes("keyboard"));
    }
    if (q.includes("shoe") || q.includes("sneaker") || q.includes("nike") || q.includes("footwear")) {
      return allMocks.filter(m => m.title.toLowerCase().includes("sneaker"));
    }
    if (q.includes("lamp") || q.includes("light") || q.includes("sunset") || q.includes("decor")) {
      return allMocks.filter(m => m.title.toLowerCase().includes("lamp") || m.title.toLowerCase().includes("light"));
    }

    return allMocks;
  }
}

/**
 * Helper to fetch a product page and run metadata parsing.
 */
async function fetchProductPageDetails(url: string): Promise<Partial<RawProductCandidate>> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000), // 10s page fetch timeout
    });

    if (!res.ok) return {};
    const html = await res.text();
    return parseProductMetadata(html, url);
  } catch (err) {
    console.warn(`Failed to fetch page content for URL: ${url}`, err);
    return {};
  }
}

/**
 * Core factory to select the active research provider based on environmental keys.
 * Gated explicitly to prevent accidental mock usage in production.
 */
export function selectProvider(): ResearchProvider {
  const allowMock = process.env.SCOUT_USE_MOCK === "true" && process.env.NODE_ENV !== "production";

  if (process.env.TAVILY_API_KEY) {
    console.log("[AI Scout] Initializing TavilyResearchProvider");
    return new TavilyResearchProvider();
  }
  if (process.env.SERPER_API_KEY) {
    console.log("[AI Scout] Initializing SerperResearchProvider");
    return new SerperResearchProvider();
  }
  if (allowMock) {
    console.log("[AI Scout] Initializing MockResearchProvider (development mode only)");
    return new MockResearchProvider();
  }

  console.log("[AI Scout] Fallback: Initializing DuckDuckGoResearchProvider (temporary scraper)");
  return new DuckDuckGoResearchProvider();
}
