import React, { useState, useEffect } from 'react';
import { useExtensionStore } from '../../store/useExtensionStore';

export default function GenerateButton() {
  const { 
    selectedCategory, 
    extractedText,
    setGenerating, 
    setError 
  } = useExtensionStore();

  const [isLoading, setIsLoading] = useState(false);
  const [hasPinnedAd, setHasPinnedAd] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['pinnedComparisonAd'], (result) => {
      if (result.pinnedComparisonAd) {
        setHasPinnedAd(true);
      }
    });
  }, []);

  const handleGenerate = async (clearPinned: boolean = false) => {
    if (!selectedCategory || !extractedText) {
      setError('Please select a category and extract text first');
      return;
    }

    try {
      setIsLoading(true);
      
      if (clearPinned) {
        await chrome.storage.local.remove('pinnedComparisonAd');
      }

      await chrome.storage.local.set({ 
        generationPayload: { text: extractedText, categoryId: selectedCategory } 
      });

      const currentWindow = await chrome.windows.getCurrent();
      
      // Open the Chrome Side Panel
      if (chrome.sidePanel && chrome.sidePanel.open && currentWindow.id !== undefined) {
        await chrome.sidePanel.open({ windowId: currentWindow.id });
      } else {
        throw new Error('Side Panel API not available. Are you using Chrome 116+?');
      }

      window.close();
    } catch (err: any) {
      console.error('Failed to start split view:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {hasPinnedAd ? (
        <div className="flex gap-2">
          <button
            onClick={() => handleGenerate(true)}
            disabled={!selectedCategory || isLoading}
            className={`
              w-1/2 py-3 px-2 rounded-lg font-display uppercase tracking-wider text-[11px]
              transition-all shadow-stamp transform hover:-translate-y-1 active:translate-y-0
              ${selectedCategory && !isLoading
                ? 'bg-ink text-paper border-2 border-ink' 
                : 'bg-ink/5 text-ink/40 border-2 border-ink/10 cursor-not-allowed shadow-none'}
            `}
          >
            {isLoading ? 'Wait...' : 'Start Fresh'}
          </button>
          <button
            onClick={() => handleGenerate(false)}
            disabled={!selectedCategory || isLoading}
            className={`
              w-1/2 py-3 px-2 rounded-lg font-display uppercase tracking-wider text-[11px]
              transition-all shadow-stamp transform hover:-translate-y-1 active:translate-y-0
              ${selectedCategory && !isLoading
                ? 'bg-ad-yellow text-ink border-2 border-ink' 
                : 'bg-ink/5 text-ink/40 border-2 border-ink/10 cursor-not-allowed shadow-none'}
            `}
          >
            {isLoading ? 'Wait...' : 'Compare'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => handleGenerate(false)}
          disabled={!selectedCategory || isLoading}
          className={`
            w-full py-3 px-6 rounded-lg font-display uppercase tracking-wider text-base
            transition-all shadow-stamp transform hover:-translate-y-1 active:translate-y-0
            ${selectedCategory && !isLoading
              ? 'bg-ad-yellow text-ink border-2 border-ink' 
              : 'bg-ink/5 text-ink/40 border-2 border-ink/10 cursor-not-allowed shadow-none'}
          `}
        >
          {isLoading ? 'Processing...' : 'Generate Honest Ad'}
        </button>
      )}
    </div>
  );
}
