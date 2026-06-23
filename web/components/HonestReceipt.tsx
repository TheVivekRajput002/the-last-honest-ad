import React from 'react';
import { AdData } from '@/lib/api';

interface AdProps {
  ad: AdData;
}

export function HonestReceipt({ ad }: AdProps) {
  const analysis = ad.analysis || {
    honestAd: ad.honestCopy,
    impactAnalysis: 'PENDING',
    badEffects: 'N/A',
    hiddenProblems: 'N/A',
    ecoAlternative: 'N/A'
  };

  return (
    <div className="mx-auto w-full max-w-[450px] bg-white shadow-overlay p-8 font-mono text-ink text-sm relative before:absolute before:top-0 before:left-0 before:right-0 before:h-2 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDEwIDUsMCAxMCwxMCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] before:bg-repeat-x after:absolute after:bottom-0 after:left-0 after:right-0 after:h-2 after:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDAgNSwxMCAxMCwwIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==')] after:bg-repeat-x">
      <div className="text-center mb-6 pt-2">
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-1">Honest Receipt</h2>
        <p className="text-receipt-gray text-xs">Date: {new Date(ad.createdAt || Date.now()).toLocaleDateString()}</p>
        <p className="text-receipt-gray text-xs">Store: The Real World</p>
      </div>

      <div className="border-t-2 border-b-2 border-dashed border-receipt-gray/50 py-4 mb-4 space-y-4">
        <div>
          <p className="font-bold text-xs uppercase text-receipt-gray mb-1">Illusion Scanned:</p>
          <p className="leading-tight line-through text-receipt-gray">{ad.originalCopy}</p>
        </div>
        
        <div>
          <p className="font-bold text-xs uppercase text-ink mb-1">True Description:</p>
          <p className="leading-tight whitespace-pre-wrap font-bold">{analysis.honestAd}</p>
        </div>
      </div>

      <div className="border-b-2 border-dashed border-receipt-gray/50 pb-4 mb-4 space-y-2">
        <p className="font-bold text-xs uppercase text-receipt-gray mb-2">Metrics Billed to Earth:</p>
        <div className="flex justify-between items-center text-xs">
          <span>Carbon Output:</span>
          <span>{ad.co2eKg || ad.footprintSaved} kg CO₂e</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span>Water Wasted:</span>
          <span>{ad.waterLiters || 0} L</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span>Solid Waste:</span>
          <span>{ad.wasteKg || 0} kg</span>
        </div>
      </div>

      <div className="border-b-2 border-dashed border-receipt-gray/50 pb-4 mb-6 space-y-4">
        <div>
          <p className="font-bold text-xs uppercase text-receipt-gray mb-1">Detailed Impact:</p>
          <p className="leading-tight text-xs whitespace-pre-wrap">{analysis.impactAnalysis}</p>
        </div>
        <div>
          <p className="font-bold text-xs uppercase text-receipt-gray mb-1 text-ad-coral">Detrimental Effects:</p>
          <p className="leading-tight text-xs whitespace-pre-wrap">{analysis.badEffects}</p>
        </div>
        <div>
          <p className="font-bold text-xs uppercase text-receipt-gray mb-1 text-warning-amber text-yellow-700">Hidden Costs:</p>
          <p className="leading-tight text-xs whitespace-pre-wrap">{analysis.hiddenProblems}</p>
        </div>
        {analysis.ecoAlternative && analysis.ecoAlternative !== 'N/A' && (
          <div>
            <p className="font-bold text-xs uppercase text-receipt-gray mb-1 text-green-600">Eco Alternative:</p>
            <p className="leading-tight text-xs text-green-600 whitespace-pre-wrap">{analysis.ecoAlternative}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-end mb-8">
        <span className="uppercase font-bold">Total Debt:</span>
        <span className="text-xl font-bold text-stamp-red">UNPAID</span>
      </div>

      <div className="text-center text-xs text-receipt-gray mt-8 pb-2">
        <p>*** NO REFUNDS FOR THE PLANET ***</p>
        <p className="mt-4 font-barcode text-4xl">1234567890</p>
      </div>
    </div>
  );
}
