"use client";

interface SkeletonCardProps {
  index?: number;
}

export default function SkeletonCard({ index = 0 }: SkeletonCardProps) {
  // Use index to vary heights dynamically to match the masonry look
  const getAspectRatioClass = (idx: number) => {
    const remainder = idx % 3;
    if (remainder === 0) return "aspect-[3/4]";
    if (remainder === 1) return "aspect-[4/5]";
    return "aspect-square";
  };

  return (
    <div className="w-full bg-card border border-card-border rounded-2xl overflow-hidden animate-pulse">
      {/* IMAGE PLACEHOLDER */}
      <div className={`w-full bg-gray-200 dark:bg-gray-800 ${getAspectRatioClass(index)}`} />

      {/* METADATA PLACEHOLDER */}
      <div className="p-3.5 space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-16" />
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-8" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-4/5" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-14" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-10" />
        </div>
      </div>
    </div>
  );
}
