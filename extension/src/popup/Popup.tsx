import React, { useEffect } from 'react';
import { useExtensionStore } from '../store/useExtensionStore';
import CategorySelector from './components/CategorySelector';
import GenerateButton from './components/GenerateButton';
import LoadingState from './components/LoadingState';

export default function Popup() {
  const { 
    isExtracting, 
    setExtracting, 
    setExtractedText, 
    setSuggestedCategory,
    setError 
  } = useExtensionStore();

  useEffect(() => {
    // Start extraction immediately when popup opens
    const extractPage = async () => {
      setExtracting(true);
      setError(null);
      
      try {
        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) throw new Error('No active tab');

        // Message content script
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_PAGE' });
        
        if (response && response.success) {
          const text = response.text;
          setExtractedText(text);

          // Call backend to extract product and category
          // For MVP, using local backend. Should be env var later.
          const apiRes = await fetch('http://localhost:4000/api/ads/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageText: text.substring(0, 5000) }) // Send first 5k chars
          });

          if (!apiRes.ok) throw new Error('Failed to classify page');
          
          const data = await apiRes.json();
          if (data.success && data.data) {
            setSuggestedCategory(data.data.category);
          }
        } else {
          throw new Error(response?.error || 'Extraction failed');
        }
      } catch (err: any) {
        console.error('Extraction error:', err);
        setError(err.message);
      } finally {
        setExtracting(false);
      }
    };

    extractPage();
  }, []);

  return (
    <div className="w-[380px] p-6 bg-paper text-ink font-body border border-ink/10 shadow-overlay bg-noise flex flex-col h-[400px]">
      <header className="flex justify-between items-center mb-6 border-b border-ink/10 pb-4 shrink-0">
        <h1 className="text-xl font-display uppercase tracking-wider text-ad-coral">Honest Ad</h1>
        <span className="px-2 py-0.5 text-[10px] font-mono bg-ink text-paper rounded uppercase">Scanner Active</span>
      </header>
      
      <main className="flex-1 flex flex-col justify-between">
        {isExtracting ? (
          <LoadingState />
        ) : (
          <>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-mono text-receipt-gray mb-2 uppercase">Classification</p>
                <CategorySelector />
              </div>
            </div>
            
            <div className="mt-auto">
              <GenerateButton />
            </div>
          </>
        )}
      </main>
      
      <footer className="mt-6 text-center text-[10px] font-mono text-receipt-gray border-t border-ink/10 pt-4 shrink-0 flex justify-between">
        <span>© 2026 TLHA</span>
        <span>MVP BUILD</span>
      </footer>
    </div>
  );
}
