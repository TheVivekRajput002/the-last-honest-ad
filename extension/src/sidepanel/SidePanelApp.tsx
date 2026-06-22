import React, { useEffect, useRef, useState } from 'react';
import { useExtensionStore } from '../store/useExtensionStore';
import { ComparisonCard } from '../components/ComparisonCard';
import { HonestReceipt } from '../components/HonestReceipt';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

export default function SidePanelApp() {
  const { isGenerating, generatedAd, error, setGenerating, setError, setGeneratedAd } = useExtensionStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Check storage for pending generation
    chrome.storage.local.get(['generationPayload'], (result) => {
      if (result.generationPayload) {
        const payload = result.generationPayload as { text: string; categoryId: string };
        startGeneration(payload.text, payload.categoryId);
        // Clear it so it doesn't run again unintentionally
        chrome.storage.local.remove('generationPayload');
      }
    });

    // Also listen for changes in case side panel is already open
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.generationPayload && changes.generationPayload.newValue) {
        const payload = changes.generationPayload.newValue as { text: string; categoryId: string };
        startGeneration(payload.text, payload.categoryId);
        chrome.storage.local.remove('generationPayload');
      }
    };
    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const startGeneration = async (text: string, categoryId: string) => {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:4000/api/ads/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalCopy: text.substring(0, 5000), categoryId })
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        setGeneratedAd(data.data);
      } else {
        throw new Error(data.error?.message || data.error || 'Failed to generate ad');
      }
    } catch (err: any) {
      console.error('Generation Error:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await htmlToImage.toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = 'honest-ad.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#FDFBF7] overflow-y-auto overflow-x-hidden font-sans text-ink flex flex-col relative">
      {/* Sticky Header */}
      <div className="flex-shrink-0 flex justify-between items-center p-3 border-b border-ink/10 bg-[#FDFBF7]/90 backdrop-blur-md sticky top-0 z-10">
        <h2 className="font-display font-bold text-base uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 bg-ad-coral rounded-full"></span>
          Analysis
        </h2>
        <div className="flex gap-2">
          {!isGenerating && generatedAd && !error && (
            <button 
              onClick={handleExport}
              disabled={isExporting}
              aria-label="Export as image"
              className="p-1.5 text-ink/70 hover:text-ink hover:bg-ink/5 rounded-md transition-colors disabled:opacity-50"
            >
              <Download size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full flex flex-col" ref={cardRef}>
        {error && (
          <div className="p-4 m-4 bg-white rounded-lg border-l-4 border-stamp-red shadow-sm">
            <h2 className="text-sm font-bold text-stamp-red uppercase tracking-wide mb-1">Generation Failed</h2>
            <p className="text-xs">{error}</p>
          </div>
        )}

        {isGenerating && !error && (
           <div className="p-4 w-full">
             <SkeletonLoader />
           </div>
        )}

        {!isGenerating && generatedAd && !error && (
          <>
            {/* The Illusion Section */}
            <div className="p-5 border-b border-dashed border-ink/10 bg-white">
              <div className="text-[10px] font-mono uppercase tracking-widest text-ink/50 mb-2">The Illusion</div>
              <p className="text-sm italic text-ink/60 line-through decoration-ad-coral/50 decoration-2 line-clamp-4">
                {generatedAd.originalCopy}
              </p>
            </div>

            {/* The Reality Section */}
            <div className="p-5 bg-ink text-white shadow-inner">
              <div className="flex items-center gap-2 mb-3 border-b border-white/20 pb-2">
                <span className="px-2 py-0.5 bg-ad-coral text-[10px] font-mono uppercase tracking-widest rounded-sm">Truth</span>
                <span className="text-xs font-mono uppercase tracking-widest text-paper">The Reality</span>
              </div>
              <p className="text-sm leading-relaxed font-medium text-paper">
                {generatedAd.analysis?.honestAd || generatedAd.honestCopy}
              </p>
            </div>

            {/* Metrics Section */}
            <div className="p-5 border-b border-dashed border-ink/10 bg-[#FDFBF7]">
              <div className="text-[10px] font-mono uppercase tracking-widest text-ink/50 mb-3">Environmental Toll</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-ink/5 shadow-sm">
                  <span className="text-lg font-display text-ink">{generatedAd.co2eKg || generatedAd.footprintSaved}</span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-ink/60 mt-1">kg CO₂e</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-ink/5 shadow-sm">
                  <span className="text-lg font-display text-blue-600">{generatedAd.waterLiters || 0}</span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-ink/60 mt-1">Liters</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-ink/5 shadow-sm">
                  <span className="text-lg font-display text-stamp-red">{generatedAd.wasteKg || 0}</span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-ink/60 mt-1">kg Waste</span>
                </div>
              </div>
            </div>

            {/* Detailed Analysis Section */}
            <div className="p-5 flex flex-col gap-3 pb-8 bg-[#FDFBF7]">
              <div className="bg-white p-4 rounded-lg border-l-4 border-ink shadow-sm">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-ink/60 mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-ink rounded-full"></span>
                  Impact Analysis
                </h4>
                <p className="text-xs text-ink/90 leading-relaxed">
                  {generatedAd.analysis?.impactAnalysis || 'Detailed analysis pending...'}
                </p>
              </div>
              
              <div className="bg-[#FFF0F0] p-4 rounded-lg border-l-4 border-ad-coral shadow-sm">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-ad-coral mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-ad-coral rounded-full"></span>
                  Detrimental Effects
                </h4>
                <p className="text-xs text-ink/90 leading-relaxed">
                  {generatedAd.analysis?.badEffects || 'Not specified.'}
                </p>
              </div>

              <div className="bg-[#FFF9E5] p-4 rounded-lg border-l-4 border-warning-amber shadow-sm">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-yellow-700 mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-warning-amber rounded-full"></span>
                  Hidden Problems
                </h4>
                <p className="text-xs text-ink/90 leading-relaxed">
                  {generatedAd.analysis?.hiddenProblems || 'Not specified.'}
                </p>
              </div>
            </div>
          </>
        )}

        {!isGenerating && !generatedAd && !error && (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 p-6 mt-10 min-h-[300px]">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-ink/40 flex items-center justify-center mb-4">
              <span className="text-xl">?</span>
            </div>
            <p className="font-body text-sm">Select a category and extract text from the popup to see the honest analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
