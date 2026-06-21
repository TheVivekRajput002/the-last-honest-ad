import { create } from 'zustand';

interface OverlayState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useOverlayStore = create<OverlayState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
