import { create } from "zustand";

type UiState = {
  cartOpen: boolean;
  mobileMenuOpen: boolean;
  quickViewSlug: string | null;
  setCartOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  openQuickView: (slug: string) => void;
  closeQuickView: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  cartOpen: false,
  mobileMenuOpen: false,
  quickViewSlug: null,
  setCartOpen: (open) => set({ cartOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  openQuickView: (slug) => set({ quickViewSlug: slug }),
  closeQuickView: () => set({ quickViewSlug: null }),
}));
