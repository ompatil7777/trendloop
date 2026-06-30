"use client";

import { Check, AlertCircle } from "lucide-react";

interface ProsConsBlockProps {
  pros: string[];
  cons: string[];
}

export default function ProsConsBlock({ pros, cons }: ProsConsBlockProps) {
  if (!pros.length && !cons.length) return null;

  return (
    <div className="grid md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-100/5 border border-card-border p-6 rounded-2xl md:rounded-3xl">
      {/* PROS (THE GOOD) */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          The Highlights
        </h4>
        <ul className="space-y-2.5">
          {pros.map((pro, index) => (
            <li key={`pro-${index}`} className="flex items-start gap-2.5 text-xs text-foreground/75 leading-relaxed">
              <Check className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
              <span>{pro}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CONS (THINGS TO CONSIDER) */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
          Keep in Mind
        </h4>
        <ul className="space-y-2.5">
          {cons.map((con, index) => (
            <li key={`con-${index}`} className="flex items-start gap-2.5 text-xs text-foreground/60 leading-relaxed">
              <AlertCircle className="w-3.5 h-3.5 text-foreground/30 flex-shrink-0 mt-0.5" />
              <span>{con}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
