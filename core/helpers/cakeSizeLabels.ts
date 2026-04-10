export const cakeSizeLabels = {
  sizexxl: "cakes.sizes.sizexxl",
  sizexl: "cakes.sizes.sizexl",
  sizel: "cakes.sizes.sizel",
  sizemd: "cakes.sizes.sizemd",
  sizesm: "cakes.sizes.sizesm",
  sizexxxs: "cakes.sizes.sizexxxs",
} as const;

export type CakeSizeKey = keyof typeof cakeSizeLabels;

export const sizePriority: CakeSizeKey[] = [
  "sizexxl",
  "sizexl",
  "sizel",
  "sizemd",
  "sizesm",
  "sizexxxs",
];
