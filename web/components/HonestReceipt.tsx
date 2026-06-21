import React from 'react';

interface AdProps {
  ad: {
    originalCopy: string;
    honestCopy: string;
    categoryId: string;
    footprintSaved: number;
  }
}

export function HonestReceipt({ ad }: AdProps) {
  return (
    <div className="mx-auto w-full max-w-[400px] bg-white shadow-overlay p-8 font-mono text-ink text-sm relative before:absolute before:top-0 before:left-0 before:right-0 before:h-2 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDEwIDUsMCAxMCwxMCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] before:bg-repeat-x after:absolute after:bottom-0 after:left-0 after:right-0 after:h-2 after:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDAgNSwxMCAxMCwwIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==')] after:bg-repeat-x">
      <div className="text-center mb-6 pt-2">
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-1">Honest Receipt</h2>
        <p className="text-receipt-gray text-xs">Date: {new Date().toLocaleDateString()}</p>
        <p className="text-receipt-gray text-xs">Store: The Real World</p>
      </div>

      <div className="border-t-2 border-b-2 border-dashed border-receipt-gray/50 py-4 mb-6 space-y-4">
        <div>
          <p className="font-bold text-xs uppercase text-receipt-gray mb-1">Item Scanned:</p>
          <p className="leading-tight">{ad.originalCopy}</p>
        </div>
        
        <div>
          <p className="font-bold text-xs uppercase text-receipt-gray mb-1">True Description:</p>
          <p className="leading-tight whitespace-pre-wrap">{ad.honestCopy}</p>
        </div>
      </div>

      <div className="flex justify-between items-end mb-8">
        <span className="uppercase text-receipt-gray">Env. Impact:</span>
        <span className="text-xl font-bold text-warning-amber">{ad.footprintSaved} kg CO₂</span>
      </div>

      <div className="text-center text-xs text-receipt-gray mt-8 pb-2">
        <p>*** THANK YOU FOR SHOPPING HONESTLY ***</p>
        <p className="mt-2">barcode placeholder</p>
      </div>
    </div>
  );
}
