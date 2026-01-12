import { create } from "zustand";
import { MenuNavEntry } from "@/core/components/app-bar/menuFactory";

interface LandingStore {
  mainNavSelected: MenuNavEntry;
  selectMainNav: (key: MenuNavEntry) => void;
}

export const useLanding = create<LandingStore>((set) => ({
  mainNavSelected: "home",
  selectMainNav: (key) => set({ mainNavSelected: key }),
}));
