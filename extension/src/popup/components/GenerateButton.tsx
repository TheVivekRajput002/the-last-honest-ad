import React, { useState } from 'react';
import { useExtensionStore } from '../../store/useExtensionStore';

export default function GenerateButton() {
  const { 
    selectedCategory, 
    extractedText,
    setGenerating, 
    setError 
  } = useExtensionStore();

  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!selectedCategory) {
      setError('Please select a category first');
      return;
    }
    if (!extractedText) {
      setError('No product text extracted');
      return;
    }

    try {
      setIsLoading(true);
      setGenerating(true);
      setError(null);
      
      const apiRes = await fetch('http://localhost:4000/api/ads/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          originalCopy: extractedText.substring(0, 5000), 
          categoryId: selectedCategory 
        })
      });

      const data = await apiRes.json();

      if (!apiRes.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to generate ad');
      }

      const generatedId = data.data.id;

      // Open new tab to the web UI
      chrome.tabs.create({ url: `http://localhost:3000/gallery/${generatedId}` });
      
      // Close popup
      window.close();
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.message);
      setGenerating(false);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={!selectedCategory || isLoading}
      className={`
        w-full py-4 px-6 rounded-lg font-display uppercase tracking-wider text-lg
        transition-all shadow-stamp transform hover:-translate-y-1 active:translate-y-0
        ${selectedCategory && !isLoading
          ? 'bg-ad-coral text-white border-2 border-ink' 
          : 'bg-ink/5 text-ink/40 border-2 border-ink/10 cursor-not-allowed shadow-none'}
      `}
    >
      {isLoading ? 'Generating...' : 'Generate Honest Ad'}
    </button>
  );
}
