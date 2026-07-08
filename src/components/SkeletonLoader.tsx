import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0F172A]/85 p-5 space-y-4 animate-pulse">
      {/* Image Block Shimmer */}
      <div className="h-44 w-full bg-white/5 rounded-xl" />
      
      {/* Title Details Shimmer */}
      <div className="space-y-2">
        <div className="h-3 w-1/3 bg-white/5 rounded" />
        <div className="h-5 w-3/4 bg-white/5 rounded" />
        <div className="h-4 w-full bg-white/5 rounded" />
      </div>

      {/* Pricing block Shimmer */}
      <div className="h-12 bg-white/5 rounded-xl" />

      {/* Footer details */}
      <div className="flex justify-between items-center pt-2">
        <div className="h-3 w-1/4 bg-white/5 rounded" />
        <div className="h-3 w-1/4 bg-white/5 rounded" />
      </div>

      {/* Button Block Shimmer */}
      <div className="h-10 bg-white/5 rounded-xl w-full" />
    </div>
  );
};
