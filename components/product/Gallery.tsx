"use client";

import { useState } from "react";
import { ProductImage } from "../../lib/mock-data/fixtures";

interface GalleryProps {
  images: ProductImage[];
}

export default function Gallery({ images }: GalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const activeImage = images[activeIdx] || {
    url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
    alt: "Product Image"
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* MAIN LARGE IMAGE */}
      <div className="relative aspect-square sm:aspect-[4/5] w-full overflow-hidden bg-gray-50 dark:bg-gray-900 border border-card-border rounded-2xl md:rounded-3xl">
        <img
          src={activeImage.url}
          alt={activeImage.alt}
          className="w-full h-full object-cover transition-all duration-300"
        />
      </div>

      {/* THUMBNAILS CAROUSEL */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar fade-mask">
          {images.map((img, idx) => (
            <button
              key={img.url}
              onClick={() => setActiveIdx(idx)}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                activeIdx === idx
                  ? "border-gold scale-95"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
