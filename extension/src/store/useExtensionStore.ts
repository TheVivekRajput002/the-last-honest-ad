import { create } from 'zustand';

interface GeneratedAd {
  id: string;
  originalCopy: string;
  honestCopy: string;
  categoryId: string;
  footprintSaved: number;
  format: 'CARD' | 'RECEIPT';
  co2eKg?: number;
  waterLiters?: number;
  wasteKg?: number;
  analysis?: {
    honestAd?: string;
    impactAnalysis?: string;
    badEffects?: string;
    hiddenProblems?: string;
    ecoAlternative?: string;
  };
  productName?: string;
}

interface ExtensionState {
  isExtracting: boolean;
  extractedText: string | null;
  suggestedCategory: string | null;
  selectedCategory: string | null;
  isGenerating: boolean;
  generatedAd: GeneratedAd | null;
  comparisonAd: GeneratedAd | null;
  error: string | null;
  
  setExtracting: (val: boolean) => void;
  setExtractedText: (text: string | null) => void;
  setSuggestedCategory: (category: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  setGenerating: (val: boolean) => void;
  setGeneratedAd: (ad: GeneratedAd | null) => void;
  setComparisonAd: (ad: GeneratedAd | null) => void;
  setError: (err: string | null) => void;
}

export const useExtensionStore = create<ExtensionState>((set) => ({
  isExtracting: false,
  extractedText: null,
  suggestedCategory: null,
  selectedCategory: null,
  isGenerating: false,
  generatedAd: null,
  comparisonAd: null,
  error: null,
  
  setExtracting: (val) => set({ isExtracting: val }),
  setExtractedText: (text) => set({ extractedText: text }),
  setSuggestedCategory: (category) => set({ suggestedCategory: category, selectedCategory: category }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setGenerating: (val) => set({ isGenerating: val }),
  setGeneratedAd: (ad) => set({ generatedAd: ad }),
  setComparisonAd: (ad) => set({ comparisonAd: ad }),
  setError: (err) => set({ error: err }),
}));
