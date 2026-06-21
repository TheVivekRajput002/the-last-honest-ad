import { create } from 'zustand';

interface PopupState {
  category: string;
  setCategory: (category: string) => void;
}

export const usePopupStore = create<PopupState>((set) => ({
  category: 'fast-fashion',
  setCategory: (category) => set({ category }),
}));
