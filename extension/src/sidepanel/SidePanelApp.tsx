import React, { useEffect, useRef, useState } from 'react';
import { useExtensionStore } from '../store/useExtensionStore';
import { ComparisonCard } from '../components/ComparisonCard';
import { HonestReceipt } from '../components/HonestReceipt';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

export default function SidePanelApp() {
  const { isGenerating, generatedAd, error, setGenerating, setError, setGeneratedAd, comparisonAd, setComparisonAd } = useExtensionStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Check storage for pending generation and pinned ad
    chrome.storage.local.get(['generationPayload', 'pinnedComparisonAd'], (result) => {
      if (result.pinnedComparisonAd) {
        setComparisonAd(result.pinnedComparisonAd);
      }
      
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
    setPublished(false);

    const currentComparisonAd = useExtensionStore.getState().comparisonAd;
    // Removed category restriction: allow comparing any two products.

    try {
      let token: string | undefined;
      try {
        if (chrome.cookies) {
          const cookie = await chrome.cookies.get({ url: 'http://localhost:3000', name: '__session' });
          if (cookie) {
            token = cookie.value;
          }
        }
      } catch (err) {
        console.warn('Could not retrieve session cookie:', err);
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('http://localhost:4000/api/ads/generate', {
        method: 'POST',
        headers,
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

  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePublish = async () => {
    if (!generatedAd || !generatedAd.id) return;
    
    setIsPublishing(true);
    try {
      let token: string | undefined;
      if (chrome.cookies) {
        const cookie = await chrome.cookies.get({ url: 'http://localhost:3000', name: '__session' });
        if (cookie) token = cookie.value;
      }
      
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:4000/api/gallery/${generatedAd.id}/publish`, {
        method: 'POST',
        headers
      });
      const data = await res.json();
      if (data.success) {
        setPublished(true);
      } else {
        alert('Failed to publish: ' + (data.error?.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Publish error:', err);
      alert('Failed to publish. Check console.');
    } finally {
      setIsPublishing(false);
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
            <>
              <button 
                onClick={() => {
                  if (comparisonAd?.id === generatedAd.id) {
                    setComparisonAd(null);
                    chrome.storage.local.remove('pinnedComparisonAd');
                  } else {
                    setComparisonAd(generatedAd);
                    chrome.storage.local.set({ pinnedComparisonAd: generatedAd });
                  }
                }}
                className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest bg-ink text-paper rounded transition-colors disabled:opacity-50"
              >
                {comparisonAd?.id === generatedAd.id ? 'Unpin Compare' : 'Pin to Compare'}
              </button>
              <button 
                onClick={handlePublish}
                disabled={isPublishing || published}
                className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest bg-ad-coral text-white rounded transition-colors disabled:opacity-50"
              >
                {published ? 'Published' : isPublishing ? 'Publishing...' : 'Publish to Gallery'}
              </button>
              <button 
                onClick={handleExport}
                disabled={isExporting}
                aria-label="Export as image"
                className="p-1.5 text-ink/70 hover:text-ink hover:bg-ink/5 rounded-md transition-colors disabled:opacity-50"
              >
                <Download size={18} />
              </button>
            </>
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

            {/* Compare Mode Section */}
            {comparisonAd && comparisonAd.id !== generatedAd.id && (
              <div className="p-5 border-b border-dashed border-ink/10 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-ink/50 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-ink rounded-full"></span>
                    Comparison
                  </div>
                  <button onClick={() => {
                    setComparisonAd(null);
                    chrome.storage.local.remove('pinnedComparisonAd');
                  }} className="text-[10px] text-stamp-red uppercase font-mono hover:underline">Clear</button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-ink/60 mb-2 border-b border-ink/5 pb-2">
                    <span className="w-2/5 truncate" title={comparisonAd.productName || 'Pinned Product'}>{comparisonAd.productName || 'Pinned Product'}</span>
                    <span className="w-1/5 text-center">vs</span>
                    <span className="w-2/5 text-right truncate text-ink font-bold" title={generatedAd.productName || 'Current Product'}>{generatedAd.productName || 'Current Product'}</span>
                  </div>
                  
                  {/* CO2e Comparison */}
                  <div className="flex justify-between items-center bg-[#FDFBF7] p-2 rounded">
                    <span className={`w-2/5 font-display text-sm ${(comparisonAd.co2eKg || comparisonAd.footprintSaved) <= (generatedAd.co2eKg || generatedAd.footprintSaved) ? 'text-green-600 font-bold' : 'text-ink/60'}`}>{comparisonAd.co2eKg || comparisonAd.footprintSaved} kg</span>
                    <span className="w-1/5 text-center text-[9px] font-mono text-ink/50 uppercase tracking-widest">CO₂e</span>
                    <span className={`w-2/5 text-right font-display text-sm ${(generatedAd.co2eKg || generatedAd.footprintSaved) <= (comparisonAd.co2eKg || comparisonAd.footprintSaved) ? 'text-green-600 font-bold' : 'text-ink/60'}`}>{generatedAd.co2eKg || generatedAd.footprintSaved} kg</span>
                  </div>

                  {/* Water Comparison */}
                  <div className="flex justify-between items-center bg-[#FDFBF7] p-2 rounded">
                    <span className={`w-2/5 font-display text-sm ${(comparisonAd.waterLiters || 0) <= (generatedAd.waterLiters || 0) ? 'text-blue-500 font-bold' : 'text-ink/60'}`}>{comparisonAd.waterLiters || 0} L</span>
                    <span className="w-1/5 text-center text-[9px] font-mono text-ink/50 uppercase tracking-widest">Water</span>
                    <span className={`w-2/5 text-right font-display text-sm ${(generatedAd.waterLiters || 0) <= (comparisonAd.waterLiters || 0) ? 'text-blue-500 font-bold' : 'text-ink/60'}`}>{generatedAd.waterLiters || 0} L</span>
                  </div>

                  {/* Waste Comparison */}
                  <div className="flex justify-between items-center bg-[#FDFBF7] p-2 rounded">
                    <span className={`w-2/5 font-display text-sm ${(comparisonAd.wasteKg || 0) <= (generatedAd.wasteKg || 0) ? 'text-green-600 font-bold' : 'text-ink/60'}`}>{comparisonAd.wasteKg || 0} kg</span>
                    <span className="w-1/5 text-center text-[9px] font-mono text-ink/50 uppercase tracking-widest">Waste</span>
                    <span className={`w-2/5 text-right font-display text-sm ${(generatedAd.wasteKg || 0) <= (comparisonAd.wasteKg || 0) ? 'text-green-600 font-bold' : 'text-ink/60'}`}>{generatedAd.wasteKg || 0} kg</span>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Analysis Section */}
            <div className="p-5 flex flex-col gap-3 pb-8 bg-[#FDFBF7]">
              <div className="bg-white p-4 rounded-lg border-l-4 border-ink shadow-sm">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-ink/60 mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-ink rounded-full"></span>
                  Impact Analysis
                </h4>
                <p className="text-xs text-ink/90 leading-relaxed whitespace-pre-wrap">
                  {generatedAd.analysis?.impactAnalysis || 'Detailed analysis pending...'}
                </p>
              </div>
              
              <div className="bg-[#FFF0F0] p-4 rounded-lg border-l-4 border-ad-coral shadow-sm">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-ad-coral mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-ad-coral rounded-full"></span>
                  Detrimental Effects
                </h4>
                <p className="text-xs text-ink/90 leading-relaxed whitespace-pre-wrap">
                  {generatedAd.analysis?.badEffects || 'Not specified.'}
                </p>
              </div>

              <div className="bg-[#FFF9E5] p-4 rounded-lg border-l-4 border-warning-amber shadow-sm">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-yellow-700 mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-warning-amber rounded-full"></span>
                  Hidden Problems
                </h4>
                <p className="text-xs text-ink/90 leading-relaxed whitespace-pre-wrap">
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
