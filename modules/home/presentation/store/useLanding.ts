import { create } from "zustand";
import { MenuNavEntry } from "@/core/components/app-bar/menuFactory";

interface LandingStore {
  mainNavSelected: MenuNavEntry;
  selectMainNav: (key: MenuNavEntry) => void;
  lang: string;
  selectLang: (value: string) => void;
}

export const useLanding = create<LandingStore>((set) => ({
  mainNavSelected: "home",
  selectMainNav: (key) => set({ mainNavSelected: key }),
  lang: "es",
  selectLang: (value) => set({ lang: value }),
}));
