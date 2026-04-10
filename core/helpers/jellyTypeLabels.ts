export const jellyTypes = {
  water: "cakes.jellyType.water",
  milk: "cakes.jellyType.milk",
  mix: "cakes.jellyType.mix",
} as const;

export type JellyTypeKey = keyof typeof jellyTypes;
