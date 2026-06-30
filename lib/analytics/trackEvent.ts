/**
 * Premium Analytics Interface
 * Wraps Google Analytics 4 (gtag) and PostHog behind a single clean abstraction.
 */

interface AnalyticsEventParams {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(eventName: string, params?: AnalyticsEventParams) {
  // Console logging for Phase 1 testing and debugging
  console.log(`[Analytics Event] "${eventName}"`, params || {});

  // Safe checks for browser window APIs in Phase 2
  if (typeof window === "undefined") return;

  try {
    // 1. Send to Google Analytics 4 (if configured)
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", eventName, params);
    }

    // 2. Send to PostHog (if configured)
    if (typeof (window as any).posthog === "object" && typeof (window as any).posthog.capture === "function") {
      (window as any).posthog.capture(eventName, params);
    }
  } catch (error) {
    console.error("Error sending analytics event:", error);
  }
}

// Predefined specific events for cleaner code consistency
export const analytics = {
  productView: (product: { id: string; name: string; price: number; category: string }) => {
    trackEvent("product_view", {
      product_id: product.id,
      product_name: product.name,
      value: product.price,
      currency: "INR",
      category: product.category,
    });
  },
  
  productSaved: (product: { id: string; name: string }) => {
    trackEvent("product_saved", {
      product_id: product.id,
      product_name: product.name,
    });
  },

  productShared: (product: { id: string; name: string }, platform: string) => {
    trackEvent("product_shared", {
      product_id: product.id,
      product_name: product.name,
      platform,
    });
  },

  buyClicked: (product: { id: string; name: string; price: number }, retailer: string) => {
    trackEvent("buy_now_clicked", {
      product_id: product.id,
      product_name: product.name,
      value: product.price,
      currency: "INR",
      retailer,
    });
  },

  newsletterSignup: (email: string, source: string) => {
    trackEvent("newsletter_signup", {
      source,
    });
  },

  searchPerformed: (query: string, resultCount: number) => {
    trackEvent("search_performed", {
      search_query: query,
      result_count: resultCount,
    });
  }
};
export default trackEvent;
