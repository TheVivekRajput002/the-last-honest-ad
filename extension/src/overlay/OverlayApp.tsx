import React, { useRef, useState } from 'react';
import { useExtensionStore } from '../store/useExtensionStore';
import { ComparisonCard } from '../components/ComparisonCard';
import { HonestReceipt } from '../components/HonestReceipt';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

export default function OverlayApp() {
  const { isGenerating, generatedAd, error } = useExtensionStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleClose = () => {
    chrome.runtime.sendMessage({ type: 'HIDE_OVERLAY' });
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
    <div className="absolute inset-0 flex flex-col bg-paper border-l-4 border-ink shadow-[-10px_0_30px_rgba(0,0,0,0.15)] pointer-events-auto overflow-hidden z-[2147483647]">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-full w-full flex flex-col"
        >
          <div className="flex-shrink-0 flex justify-between items-center p-4 border-b-2 border-ink bg-white">
            <h2 className="font-display font-bold text-lg uppercase tracking-wider text-ink">Analysis Split View</h2>
            <div className="flex gap-2">
              {!isGenerating && generatedAd && !error && (
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  aria-label="Export as image"
                  className="p-2 bg-paper text-ink rounded-full shadow-overlay hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <Download size={20} />
                </button>
              )}
              <button 
                onClick={handleClose}
                aria-label="Close split view"
                className="p-2 bg-paper text-ink rounded-full shadow-overlay hover:bg-white transition-colors flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col">
            {error && (
              <div className="p-6 bg-white rounded-xl shadow-overlay text-center border-l-4 border-stamp-red">
                <h2 className="text-xl font-display text-stamp-red mb-2">Error Generation Failed</h2>
                <p className="font-body">{error}</p>
              </div>
            )}

            {isGenerating && !error && <SkeletonLoader />}

            {!isGenerating && generatedAd && !error && (
              <div ref={cardRef} className="bg-transparent rounded-2xl flex justify-center w-full">
                <div className="w-full max-w-[400px]">
                  {generatedAd.format === 'RECEIPT' ? (
                    <HonestReceipt ad={generatedAd} />
                  ) : (
                    <ComparisonCard ad={generatedAd} />
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
