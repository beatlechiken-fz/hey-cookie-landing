export function normalizeCake(cake: any) {
  const sizes = [
    { key: "sizexl", label: "XL" },
    { key: "sizel", label: "L" },
    { key: "sizemd", label: "MD" },
    { key: "sizesm", label: "SM" },
  ].filter((s) => cake[s.key]);

  return {
    ...cake,
    sizes,
  };
}
