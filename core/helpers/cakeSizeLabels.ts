export const cakeSizeLabels = {
  sizexl: "cakes.sizes.sizexl",
  sizel: "cakes.sizes.sizel",
  sizemd: "cakes.sizes.sizemd",
  sizesm: "cakes.sizes.sizesm",
} as const;

export type CakeSizeKey = keyof typeof cakeSizeLabels;
