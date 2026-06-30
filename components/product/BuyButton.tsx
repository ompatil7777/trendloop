"use client";

import { useApp } from "../../lib/context/AppContext";
import { analytics } from "../../lib/analytics/trackEvent";
import { ShoppingBag, ArrowUpRight } from "lucide-react";

interface BuyButtonProps {
  productId: string;
  productName: string;
  price: number;
  retailer: 'amazon' | 'flipkart' | 'myntra' | 'nike' | 'keychron';
}

export default function BuyButton({ productId, productName, price, retailer }: BuyButtonProps) {
  const { addToast } = useApp();

  const handleBuyClick = () => {
    // 1. Fire local analytics event
    analytics.buyClicked({ id: productId, name: productName, price }, retailer);
    
    // 2. Add visual feedback toast
    addToast(`Redirecting to ${retailer.toUpperCase()}...`, "info");
  };

  const getRetailerLabel = (ret: string) => {
    switch (ret) {
      case 'amazon': return "Buy at Amazon";
      case 'flipkart': return "Buy at Flipkart";
      case 'myntra': return "Buy at Myntra";
      case 'nike': return "Shop on Nike";
      case 'keychron': return "Shop on Keychron";
      default: return `Shop on ${ret.toUpperCase()}`;
    }
  };

  const redirectUrl = `/api/redirect/${productId}?retailer=${retailer}`;

  return (
    <a
      href={redirectUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleBuyClick}
      className="w-full flex items-center justify-between gap-3 px-6 py-4 rounded-xl bg-foreground text-background hover:bg-gold hover:text-white dark:bg-foreground dark:text-background dark:hover:bg-gold dark:hover:text-white transition-all duration-300 shadow-md font-sans text-sm font-bold tracking-wider uppercase group"
    >
      <span className="flex items-center gap-2">
        <ShoppingBag className="w-4 h-4 group-hover:scale-105 transition-transform" />
        {getRetailerLabel(retailer)}
      </span>
      <span className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] lowercase font-normal italic tracking-normal">outbound</span>
        <ArrowUpRight className="w-4 h-4" />
      </span>
    </a>
  );
}
