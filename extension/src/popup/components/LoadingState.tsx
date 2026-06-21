import React from 'react';

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-ink/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-ad-coral rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="font-mono text-xs text-receipt-gray animate-pulse">Scanning Product DNA...</p>
    </div>
  );
}
