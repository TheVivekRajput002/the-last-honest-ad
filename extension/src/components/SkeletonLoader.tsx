import React from 'react';
import { motion } from 'framer-motion';

export function SkeletonLoader() {
  return (
    <div className="flex flex-col md:flex-row w-full h-[600px] bg-paper shadow-overlay rounded-2xl overflow-hidden border border-ink/10 relative">
      {/* Shimmer Effect */}
      <motion.div 
        className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
        animate={{ x: ['-200%', '200%'] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
      />
      
      {/* Ad Half Skeleton */}
      <div className="flex-1 p-10 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-ink/10 border-dashed">
        <div className="w-24 h-6 bg-ink/10 rounded-full mb-8 self-start" />
        <div className="w-full space-y-4">
          <div className="h-12 bg-ink/10 rounded-lg w-3/4 mx-auto" />
          <div className="h-12 bg-ink/10 rounded-lg w-5/6 mx-auto" />
          <div className="h-12 bg-ink/10 rounded-lg w-1/2 mx-auto" />
        </div>
      </div>

      {/* Honest Half Skeleton */}
      <div className="flex-1 p-10 bg-[#E8E2D2] flex flex-col justify-center items-center shadow-inner">
        <div className="w-24 h-6 bg-receipt-gray/20 rounded-full mb-8 self-end" />
        <div className="w-full space-y-3 mb-12">
          <div className="h-4 bg-receipt-gray/20 rounded w-full" />
          <div className="h-4 bg-receipt-gray/20 rounded w-11/12" />
          <div className="h-4 bg-receipt-gray/20 rounded w-4/5" />
          <div className="h-4 bg-receipt-gray/20 rounded w-full" />
        </div>
        <div className="w-48 h-32 bg-receipt-gray/20 rounded-lg transform rotate-[-12deg]" />
      </div>
    </div>
  );
}
