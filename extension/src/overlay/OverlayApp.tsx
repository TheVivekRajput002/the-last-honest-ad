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
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[2147483647]">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl w-full mx-4"
        >
          <div className="absolute -top-12 right-0 flex gap-2">
            {!isGenerating && generatedAd && !error && (
              <button 
                onClick={handleExport}
                disabled={isExporting}
                aria-label="Export as image"
                className="p-2 bg-paper text-ink rounded-full shadow-overlay hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Download size={24} />
              </button>
            )}
            <button 
              onClick={handleClose}
              aria-label="Close overlay"
              className="p-2 bg-paper text-ink rounded-full shadow-overlay hover:bg-white transition-colors flex items-center justify-center"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="p-6 bg-white rounded-xl shadow-overlay text-center border-l-4 border-stamp-red">
              <h2 className="text-xl font-display text-stamp-red mb-2">Error Generation Failed</h2>
              <p className="font-body">{error}</p>
            </div>
          )}

          {isGenerating && !error && <SkeletonLoader />}

          {!isGenerating && generatedAd && !error && (
            <div ref={cardRef} className="bg-transparent rounded-2xl">
              {generatedAd.format === 'RECEIPT' ? (
                <HonestReceipt ad={generatedAd} />
              ) : (
                <ComparisonCard ad={generatedAd} />
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
