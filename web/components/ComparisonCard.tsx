import React from 'react';

interface AdProps {
  ad: {
    originalCopy: string;
    honestCopy: string;
    categoryId: string;
    footprintSaved: number;
  }
}

export function ComparisonCard({ ad }: AdProps) {
  return (
    <div className="flex flex-col md:flex-row w-full max-w-4xl h-auto md:h-[600px] bg-paper shadow-overlay rounded-2xl overflow-hidden font-sans border border-ink/10 bg-noise">
      {/* Ad Half */}
      <div className="flex-1 p-10 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-ink/10 border-dashed relative">
        <div className="absolute top-6 left-6 px-3 py-1 bg-ink text-paper text-xs font-mono uppercase tracking-widest rounded-full">
          The Illusion
        </div>
        <h2 className="text-4xl md:text-5xl font-display uppercase tracking-tight text-ad-coral leading-[1.1]">
          {ad.originalCopy}
        </h2>
      </div>

      {/* Honest Half */}
      <div className="flex-1 p-10 bg-[#E8E2D2] flex flex-col justify-center items-center text-center relative shadow-inner">
        <div className="absolute top-6 right-6 px-3 py-1 bg-transparent text-receipt-gray border border-receipt-gray text-xs font-mono uppercase tracking-widest rounded-full">
          The Reality
        </div>
        
        <div className="font-mono text-ink text-lg leading-relaxed mb-8 max-w-md whitespace-pre-wrap">
          {ad.honestCopy}
        </div>
        
        {/* Stamp Badge */}
        <div className="mt-4 transform rotate-[-12deg] border-4 border-stamp-red text-stamp-red p-4 rounded-lg shadow-stamp inline-block bg-paper/50 backdrop-blur-sm">
          <p className="font-display text-2xl uppercase leading-none mb-1">True Cost</p>
          <p className="font-mono text-xl font-bold">{ad.footprintSaved}kg CO₂e</p>
        </div>
      </div>
    </div>
  );
}
