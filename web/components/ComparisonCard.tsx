import React from 'react';
import { AdData } from '@/lib/api';
import { AlertTriangle, Droplets, Factory, Wind } from 'lucide-react';

interface AdProps {
  ad: AdData;
}

export function ComparisonCard({ ad }: AdProps) {
  const analysis = ad.analysis || {
    honestAd: ad.honestCopy,
    impactAnalysis: 'Detailed analysis pending...',
    badEffects: 'Not specified.',
    hiddenProblems: 'Not specified.'
  };

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-5xl min-h-[600px] h-auto bg-paper shadow-overlay rounded-2xl overflow-hidden font-sans border border-ink/10 bg-noise">
      {/* Ad Half */}
      <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center items-center text-center border-b lg:border-b-0 lg:border-r border-ink/10 border-dashed relative bg-white">
        <div className="absolute top-6 left-6 px-3 py-1 bg-ink text-paper text-xs font-mono uppercase tracking-widest rounded-full shadow-sm">
          The Illusion
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-display uppercase tracking-tight text-ink/40 leading-[1.2] text-balance line-through decoration-ad-coral decoration-4 mb-8 line-clamp-4 overflow-hidden">
          {ad.originalCopy}
        </h2>
        
        {/* The Honest Ad Overlay */}
        <div className="relative mt-4 p-8 bg-ink text-paper w-full max-w-md rounded-xl transform -rotate-2 shadow-2xl transition-transform hover:rotate-0 duration-300">
           <div className="absolute -top-3 -right-3 bg-ad-coral text-white text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-sm shadow-md transform rotate-12">Truth</div>
           <h3 className="text-lg font-mono uppercase tracking-wider mb-4 text-ad-coral border-b border-paper/20 pb-2">The Reality</h3>
           <p className="font-sans text-base md:text-lg leading-relaxed text-balance">{analysis.honestAd}</p>
        </div>
      </div>

      {/* Honest Half / Analysis */}
      <div className="flex-1 p-8 lg:p-12 bg-[#E8E2D2] flex flex-col justify-start items-start text-left relative shadow-inner overflow-y-auto">
        <div className="absolute top-6 right-6 px-3 py-1 bg-transparent text-receipt-gray border border-receipt-gray text-xs font-mono uppercase tracking-widest rounded-full flex items-center gap-2">
          <AlertTriangle size={14} />
          Impact Analysis
        </div>
        
        <div className="w-full mt-10 flex flex-col gap-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="flex flex-col items-center p-4 bg-white/60 rounded-xl border border-ink/5 shadow-sm transition-transform hover:-translate-y-1">
              <Wind className="text-ink mb-2" size={24} />
              <span className="text-2xl font-display text-ink">{ad.co2eKg || ad.footprintSaved}</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink/60 mt-1">kg CO₂e</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/60 rounded-xl border border-ink/5 shadow-sm transition-transform hover:-translate-y-1">
              <Droplets className="text-blue-500 mb-2" size={24} />
              <span className="text-2xl font-display text-ink">{ad.waterLiters || 0}</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink/60 mt-1">Liters Water</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/60 rounded-xl border border-ink/5 shadow-sm transition-transform hover:-translate-y-1">
              <Factory className="text-stamp-red mb-2" size={24} />
              <span className="text-2xl font-display text-ink">{ad.wasteKg || 0}</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink/60 mt-1">kg Waste</span>
            </div>
          </div>

          <div className="space-y-4 mt-2">
            <div className="bg-white/60 p-5 rounded-xl border-l-4 border-ink shadow-sm">
              <h4 className="font-mono text-xs uppercase tracking-widest text-ink/60 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-ink rounded-full"></span>
                Environmental Impact
              </h4>
              <p className="text-sm font-sans text-ink leading-relaxed">{analysis.impactAnalysis}</p>
            </div>
            
            <div className="bg-[#FFE5E5] p-5 rounded-xl border-l-4 border-ad-coral shadow-sm">
              <h4 className="font-mono text-xs uppercase tracking-widest text-ad-coral mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-ad-coral rounded-full"></span>
                Detrimental Effects
              </h4>
              <p className="text-sm font-sans text-ink leading-relaxed">{analysis.badEffects}</p>
            </div>

            <div className="bg-[#FFF5D6] p-5 rounded-xl border-l-4 border-warning-amber shadow-sm">
              <h4 className="font-mono text-xs uppercase tracking-widest text-yellow-700 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-warning-amber rounded-full"></span>
                Hidden Problems
              </h4>
              <p className="text-sm font-sans text-ink leading-relaxed">{analysis.hiddenProblems}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
