"use client";

import { useState } from "react";
import { useApp } from "../../../lib/context/AppContext";
import { Product } from "../../../lib/mock-data/fixtures";
import BuyButton from "../../../components/product/BuyButton";
import { Heart, Share2, FolderPlus, Check, Plus, AlertCircle } from "lucide-react";
import { analytics } from "../../../lib/analytics/trackEvent";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { isSaved, toggleSaveProduct, formatPrice, boards, createBoard, addProductToBoard, addToast } = useApp();
  const [boardDropdownOpen, setBoardDropdownOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [showNewBoardInput, setShowNewBoardInput] = useState(false);
  
  const saved = isSaved(product.id);

  const handleSave = () => {
    toggleSaveProduct(product.id);
  };

  const handleShare = async () => {
    const productUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: productUrl,
        });
        analytics.productShared(product, "native");
      } else {
        await navigator.clipboard.writeText(productUrl);
        addToast("Link copied to clipboard!", "success");
        analytics.productShared(product, "copy_link");
      }
    } catch (err) {
      console.error("Error sharing product:", err);
    }
  };

  const handleCreateBoardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    
    const board = await createBoard(newBoardName.trim(), "Curated from product page");
    if (board) {
      await addProductToBoard(board.id, product.id);
    }
    setNewBoardName("");
    setShowNewBoardInput(false);
  };

  // Mock retailers - in Phase 2 these are fetched from the `affiliate_links` table
  // We match products based on category/brand
  const getMockRetailers = (prod: Product): ('amazon' | 'flipkart' | 'myntra' | 'nike' | 'keychron')[] => {
    if (prod.brand === "Keychron") return ['keychron', 'amazon'];
    if (prod.brand === "BANDAI") return ['amazon'];
    if (prod.brand === "IRON-CRAFT") return ['amazon'];
    if (prod.category_id === "cat-1") return ['myntra', 'amazon']; // Streetwear
    if (prod.category_id === "cat-5") return ['nike', 'amazon']; // Fitness
    return ['amazon'];
  };

  const retailers = getMockRetailers(product);

  return (
    <div className="space-y-6">
      
      {/* 1. BRAND & TITLE */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">
            {product.brand}
          </span>
          {product.is_trending && (
            <span className="bg-gold-light text-gold text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Trending Vibe
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase text-foreground leading-tight font-display">
          {product.name}
        </h1>
      </div>

      {/* 2. PRICE */}
      <div className="border-y border-card-border py-4 flex items-baseline gap-3">
        <span className="text-3xl font-black text-foreground">
          {formatPrice(product.price)}
        </span>
        <span className="text-[10px] text-foreground/40 font-medium">
          Price at retailer, may vary
        </span>
      </div>

      {/* 3. DESCRIPTION */}
      <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed font-sans">
        {product.description}
      </p>

      {/* 4. ACTIONS (Save, Add-To-Board, Share) */}
      <div className="flex flex-wrap gap-2.5 pt-2">
        {/* Save Toggle */}
        <button
          onClick={handleSave}
          className={`flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
            saved
              ? "bg-gold border-gold text-white"
              : "border-card-border hover:bg-gray-100 dark:hover:bg-gray-100/10 text-foreground"
          }`}
        >
          <Heart className={`w-4 h-4 ${saved ? "fill-white" : ""}`} />
          {saved ? "Saved" : "Save"}
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-card-border hover:bg-gray-100 dark:hover:bg-gray-100/10 text-foreground font-bold text-xs uppercase tracking-wider transition-all duration-200"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>

        {/* Board Pin Dropdown Wrapper */}
        <div className="relative flex-grow sm:flex-grow-0">
          <button
            onClick={() => setBoardDropdownOpen(!boardDropdownOpen)}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
              boardDropdownOpen
                ? "bg-foreground text-background border-foreground"
                : "border-card-border hover:bg-gray-100 dark:hover:bg-gray-100/10 text-foreground"
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            Pin to Board
          </button>

          {/* Pin Dropdown Card */}
          {boardDropdownOpen && (
            <div className="absolute right-0 sm:left-0 top-full mt-2 z-30 w-64 p-4 rounded-2xl glass-effect shadow-xl border border-card-border animate-slide-up text-foreground">
              <div className="flex items-center justify-between mb-3 border-b border-card-border pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Pin to a board</span>
                <button onClick={() => setBoardDropdownOpen(false)} className="text-[9px] font-bold hover:text-gold uppercase tracking-wider">close</button>
              </div>

              {/* Board List */}
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1 no-scrollbar">
                {boards.map((board) => {
                  const alreadyPinned = board.items.some(item => item.product_id === product.id);
                  return (
                    <button
                      key={board.id}
                      onClick={() => {
                        addProductToBoard(board.id, product.id);
                        setBoardDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between gap-2 p-2 rounded-lg text-left text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-100/10 transition-colors"
                    >
                      <span className="truncate">{board.name}</span>
                      {alreadyPinned ? (
                        <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-foreground/40 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Create Board Inline */}
              <div className="border-t border-card-border mt-3 pt-3">
                {showNewBoardInput ? (
                  <form onSubmit={handleCreateBoardSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Board name..."
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      className="flex-grow px-2.5 py-1.5 text-xs rounded-lg border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
                      autoFocus
                    />
                    <button type="submit" className="px-2.5 py-1.5 rounded-lg bg-foreground text-background text-[10px] font-bold uppercase tracking-wider hover:bg-gold hover:text-white transition-colors">
                      Create
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowNewBoardInput(true)}
                    className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg border border-dashed border-card-border text-[10px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Board
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. SPEC DETAILS / FEATURES ACCORDION */}
      {product.features && product.features.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50">
            Product Specifications
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground/75 leading-relaxed font-sans list-disc list-inside">
            {product.features.map((feat, index) => (
              <li key={`feat-${index}`} className="marker:text-gold">
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 6. OUTBOUND RETAILER REDIRECT CTAS */}
      <div className="space-y-3 pt-6 border-t border-card-border">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-foreground/40">
          <AlertCircle className="w-3.5 h-3.5 text-gold" />
          <span>Affiliate Outbound Links</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {retailers.map((ret) => (
            <BuyButton
              key={ret}
              productId={product.id}
              productName={product.name}
              price={product.price}
              retailer={ret}
            />
          ))}
        </div>
        <p className="text-[10px] text-foreground/35 leading-relaxed italic text-center">
          As an affiliate discovery platform, we may earn a commission when you purchase through these outbound redirects.
        </p>
      </div>

    </div>
  );
}
