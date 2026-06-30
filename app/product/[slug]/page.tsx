import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "../../../lib/data/products";
import Gallery from "../../../components/product/Gallery";
import ProsConsBlock from "../../../components/product/ProsConsBlock";
import RelatedRail from "../../../components/product/RelatedRail";
import ProductDetailClient from "./product-detail-client";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic SEO metadata generator.
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return {
      title: "Product Not Found — Trendloop",
    };
  }

  const imageUrl = product.images[0]?.url || "";

  return {
    title: `${product.brand} ${product.name} — Trendloop`,
    description: product.description,
    openGraph: {
      title: `${product.brand} ${product.name} — Trendloop`,
      description: product.description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  // If the product doesn't exist, trigger Next.js 404 handler
  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, 6);

  // Structured Data (JSON-LD Product Schema)
  const productSchemaJson = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images.map(img => img.url),
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": product.price,
      "highPrice": product.price * 1.1, // Mock variations
      "offerCount": "2",
      "price": product.price
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Dynamic JSON-LD injection for Google Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchemaJson) }}
      />

      {/* Main product display grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Left Column: Swipeable image gallery */}
        <div className="md:col-span-6 w-full">
          <Gallery images={product.images} />
        </div>
        
        {/* Right Column: Interaction details & checkout links */}
        <div className="md:col-span-6 w-full">
          <ProductDetailClient product={product} />
        </div>
      </div>

      {/* Editorial Verdict: Pros & Cons Block */}
      <div className="border-t border-card-border pt-8 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/40">
            Editorial Review
          </h3>
          <p className="text-xs text-foreground/50">
            Based on curated reviews from style forums and setups communities.
          </p>
        </div>
        <ProsConsBlock pros={product.pros} cons={product.cons} />
      </div>

      {/* Horizontally scrollable related products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-card-border pt-12">
          <RelatedRail products={relatedProducts} />
        </div>
      )}

    </div>
  );
}
