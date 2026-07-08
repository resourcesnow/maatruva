import { create } from "zustand";

type WishlistState = {
  ids: Set<string>;
  loaded: boolean;
  setIds: (ids: string[]) => void;
  toggle: (id: string) => void;
};

export const useWishlistStore = create<WishlistState>((set) => ({
  ids: new Set(),
  loaded: false,
  setIds: (ids) => set({ ids: new Set(ids), loaded: true }),
  toggle: (id) =>
    set((state) => {
      const next = new Set(state.ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ids: next };
    }),
}));
