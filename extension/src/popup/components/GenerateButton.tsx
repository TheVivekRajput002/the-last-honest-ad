import React from 'react';
import { useExtensionStore } from '../../store/useExtensionStore';

export default function GenerateButton() {
  const { 
    selectedCategory, 
    extractedText,
    setGenerating, 
    setGeneratedAd, 
    setError 
  } = useExtensionStore();

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
      // 1. Tell content script to show overlay
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab');
      await chrome.tabs.sendMessage(tab.id, { type: 'SHOW_OVERLAY' });

      // 2. Start generation process
      setGenerating(true);
      setError(null);
      
      // We close the popup after triggering generation, but we actually want the state 
      // to persist so we can show it in the overlay. Wait, if popup closes, its state is lost!
      // In a real extension, we should have a background script orchestrate this or just let the overlay fetch.
      // But actually, we can trigger the API call from the popup before it closes, or we can send the extracted text 
      // to the overlay and let the overlay make the API call. 
      // Wait, let's keep it simple: the popup makes the call and sends the result to the overlay via messaging.
      // Or we can just let the overlay make the call.
      
      // Let's pass the text and category to the content script/overlay and let it handle the generation.
      await chrome.tabs.sendMessage(tab.id, { 
        type: 'START_GENERATION', 
        payload: { text: extractedText, categoryId: selectedCategory } 
      });
      
      // Close the popup so user sees the overlay
      window.close();
      
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.message);
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={!selectedCategory}
      className={`
        w-full py-4 px-6 rounded-lg font-display uppercase tracking-wider text-lg
        transition-all shadow-stamp transform hover:-translate-y-1 active:translate-y-0
        ${selectedCategory 
          ? 'bg-ad-coral text-white border-2 border-ink' 
          : 'bg-ink/5 text-ink/40 border-2 border-ink/10 cursor-not-allowed shadow-none'}
      `}
    >
      Generate Honest Ad
    </button>
  );
}
