import { CakeItem } from "@/modules/quote/presentation/components/QuoteSection";

export const DATA = {
  // Precios de bizcocho para 24 cm (columna D de la hoja Bizcochos)
  cake: [
    { id: "Vainilla", label: "Vainilla", basePrice: 72.11 },
    { id: "Chocolate", label: "Chocolate", basePrice: 109.58 },
    { id: "Fresa", label: "Fresa", basePrice: 120.97 },
    { id: "Moka", label: "Moka", basePrice: 151.98 },
    { id: "Red Velvet", label: "Red Velvet", basePrice: 76.63 },
  ] as CakeItem[],

  // Precios de cobertura 24 cm (fila 23 de "Coberturas y rellenos")
  cobertura: [
    {
      id: "Buttercream QC",
      label: "Buttercream Queso crema",
      basePrice: 99.36,
    },
    { id: "Frosting QC", label: "Frosting Queso crema", basePrice: 80.36 },
    { id: "Crema mantequilla", label: "Crema mantequilla", basePrice: 75.77 },
    { id: "Musseline", label: "Musseline", basePrice: 70.32 },
    { id: "Ganache", label: "Ganache", basePrice: 39.62 },
    { id: "Bariloche", label: "Bariloche", basePrice: 43.54 },
    { id: "Jalea de mango", label: "Jalea de mango", basePrice: 25.66 },
    { id: "Ninguna", label: "Ninguna", basePrice: 0 },
  ] as CakeItem[],

  // Sabores de cobertura (tabla K21:L30)
  saborCobertura: [
    { id: "Moka", label: "Moka", basePrice: 10 },
    { id: "Cafe", label: "Café", basePrice: 13 },
    { id: "Nutella", label: "Nutella", basePrice: 10 },
    { id: "Fresa", label: "Fresa", basePrice: 12 },
    { id: "Frutos rojos", label: "Frutos rojos", basePrice: 23 },
    { id: "Chocolate", label: "Chocolate", basePrice: 10 },
    { id: "Malvavisco", label: "Malvavisco", basePrice: 15 },
    { id: "Mazapan", label: "Mazapán", basePrice: 15 },
    { id: "Petalos", label: "Pétalos", basePrice: 23 },
    { id: "Ninguna", label: "Ninguno", basePrice: 0 },
  ] as CakeItem[],

  relleno: [
    {
      id: "Buttercream QC",
      label: "Buttercream Queso crema",
      basePrice: 99.36,
    },
    { id: "Frosting QC", label: "Frosting Queso crema", basePrice: 80.36 },
    { id: "Crema mantequilla", label: "Crema mantequilla", basePrice: 75.77 },
    { id: "Musseline", label: "Musseline", basePrice: 70.32 },
    { id: "Ganache", label: "Ganache", basePrice: 39.62 },
    { id: "Bariloche", label: "Bariloche", basePrice: 43.54 },
    { id: "Jalea de mango", label: "Jalea de mango", basePrice: 25.66 },
    { id: "Ninguna", label: "Ninguna", basePrice: 0 },
  ] as CakeItem[],

  saborRelleno: [
    { id: "Moka", label: "Moka", basePrice: 10 },
    { id: "Cafe", label: "Café", basePrice: 13 },
    { id: "Nutella", label: "Nutella", basePrice: 10 },
    { id: "Fresa", label: "Fresa", basePrice: 12 },
    { id: "Frutos rojos", label: "Frutos rojos", basePrice: 23 },
    { id: "Chocolate", label: "Chocolate", basePrice: 10 },
    { id: "Malvavisco", label: "Malvavisco", basePrice: 15 },
    { id: "Mazapan", label: "Mazapán", basePrice: 15 },
    { id: "Petalos", label: "Pétalos", basePrice: 23 },
    { id: "Ninguna", label: "Ninguno", basePrice: 0 },
  ] as CakeItem[],

  // Licores (hoja Licores A:B)
  licor: [
    { id: "Cafe", label: "Café", basePrice: 5 },
    { id: "Baileys", label: "Baileys", basePrice: 10 },
    { id: "Brandy", label: "Brandy", basePrice: 5 },
    { id: "Tequila", label: "Tequila", basePrice: 7 },
    { id: "Ron", label: "Ron", basePrice: 7 },
    { id: "Cognac", label: "Cognac", basePrice: 15 },
    { id: "Naranja", label: "Naranja", basePrice: 5 },
    { id: "Ninguno", label: "Ninguno", basePrice: 0 },
  ] as CakeItem[],

  // Jarabes — precios son el "Precio" final de la hoja (fila 16)
  jarabe: [
    { id: "Tres leches", label: "Tres leches", basePrice: 61.54 },
    { id: "Tres leches coco", label: "Tres leches coco", basePrice: 60.9 },
    { id: "Almibar", label: "Almíbar", basePrice: 3.81 },
    { id: "Ninguno", label: "Ninguno", basePrice: 0 },
  ] as CakeItem[],

  saborJarabe: [
    { id: "Moka", label: "Moka", basePrice: 10 },
    { id: "Cafe", label: "Café", basePrice: 13 },
    { id: "Nutella", label: "Nutella", basePrice: 10 },
    { id: "Fresa", label: "Fresa", basePrice: 12 },
    { id: "Frutos rojos", label: "Frutos rojos", basePrice: 23 },
    { id: "Chocolate", label: "Chocolate", basePrice: 10 },
    { id: "Naranja", label: "Naranja", basePrice: 30 },
    { id: "Malvavisco", label: "Malvavisco", basePrice: 15 },
    { id: "Mazapan", label: "Mazapán", basePrice: 15 },
    { id: "Petalos", label: "Pétalos", basePrice: 20 },
    { id: "Ninguna", label: "Ninguno", basePrice: 0 },
  ] as CakeItem[],

  // Toppings — columna B (precio para 24 cm)
  toppings: [
    { id: "Mermelada fresa", label: "Mermelada de fresa", basePrice: 25 },
    {
      id: "Mermelada frutos rojos",
      label: "Mermelada de frutos rojos",
      basePrice: 50,
    },
    { id: "Mermelada durazno", label: "Mermelada de durazno", basePrice: 26 },
    { id: "Jalea mango", label: "Jalea de mango", basePrice: 25 },
    {
      id: "Choc Turin blanco",
      label: "Chocolate Turin blanco",
      basePrice: 20.1,
    },
    {
      id: "Choc Turin oscuro",
      label: "Chocolate Turin oscuro",
      basePrice: 22.35,
    },
    { id: "Choc KitKat", label: "Chocolate KitKat", basePrice: 30 },
    { id: "Choc De la Rosa", label: "Chocolate de la Rosa", basePrice: 24 },
    { id: "Krankys", label: "Krankys", basePrice: 11.5 },
    { id: "Lunetas", label: "Lunetas", basePrice: 80 },
    {
      id: "Choc Sicao blanco",
      label: "Chocolate Sicao blanco",
      basePrice: 9.75,
    },
    {
      id: "Choc Sicao oscuro",
      label: "Chocolate Sicao oscuro",
      basePrice: 19.85,
    },
    { id: "Choc Baileys", label: "Chocolate Baileys", basePrice: 48 },
    { id: "Mazapan", label: "Mazapán", basePrice: 30 },
    { id: "Malvavisco", label: "Malvavisco", basePrice: 15 },
    { id: "Almendra", label: "Almendra", basePrice: 10 },
    { id: "Cacao", label: "Cacao", basePrice: 15 },
    { id: "Canela", label: "Canela", basePrice: 3 },
    { id: "Galleta", label: "Galleta", basePrice: 9.39 },
    { id: "Fruta", label: "Fruta", basePrice: 40 },
    { id: "Calabaza", label: "Calabaza", basePrice: 7 },
    { id: "Cafe", label: "Café", basePrice: 12 },
    { id: "Coco", label: "Coco", basePrice: 6 },
    { id: "Nuez", label: "Nuez", basePrice: 6 },
    { id: "Ninguno", label: "Ninguno", basePrice: 0 },
  ] as CakeItem[],

  // Empaques (hoja Empaques A:B — precios reales del archivo)
  empaque: [
    { id: "Domo 32", label: "Domo #32", basePrice: 25 },
    { id: "Domo 30", label: "Domo #30", basePrice: 22 },
    { id: "Domo 28", label: "Domo #28", basePrice: 21 },
    { id: "Domo 26", label: "Domo #26", basePrice: 18 },
    { id: "Domo 24", label: "Domo #24", basePrice: 16.5 },
    { id: "Domo 22", label: "Domo #22", basePrice: 16 },
    { id: "Domo 20", label: "Domo #20", basePrice: 13 },
    { id: "Domo 18", label: "Domo #18", basePrice: 10 },
    { id: "Domo barra panque", label: "Domo barra para panqué", basePrice: 19 },
    {
      id: "Domo rect largo",
      label: "Domo rectangular barra largo",
      basePrice: 23,
    },
    {
      id: "Domo rect chico",
      label: "Domo rectangular barra chico",
      basePrice: 20,
    },
    {
      id: "Domo rect cuad grande",
      label: "Domo rectangular cuadrado grande",
      basePrice: 50,
    },
    {
      id: "Domo rect cuad chico",
      label: "Domo rectangular cuadrado chico",
      basePrice: 40,
    },
    { id: "Domo chocorol", label: "Domo para chocorol", basePrice: 10 },
    { id: "Domo 6 muffins", label: "Domo para 6 muffins", basePrice: 12 },
    { id: "Domo cupcake", label: "Domo cupcake individual", basePrice: 2 },
    { id: "Domo pay 26", label: "Domo pay 26", basePrice: 10 },
    { id: "Domo pay 24", label: "Domo pay 24", basePrice: 12 },
    { id: "Domo pay 20", label: "Domo pay 20", basePrice: 15 },
    { id: "Molde flan", label: "Molde flan individual 7.5 cm", basePrice: 8 },
    { id: "Plato carton 30", label: "Plato cartón pastel 30", basePrice: 12 },
    { id: "Plato carton 28", label: "Plato cartón pastel 28", basePrice: 13 },
    { id: "Plato carton 26", label: "Plato cartón pastel 26", basePrice: 10 },
    { id: "Plato carton 24", label: "Plato cartón pastel 24", basePrice: 9 },
    { id: "Plato carton 22", label: "Plato cartón pastel 22", basePrice: 8 },
    { id: "Plato carton 20", label: "Plato cartón pastel 20", basePrice: 7 },
    { id: "Plato carton 18", label: "Plato cartón pastel 18", basePrice: 5 },
    { id: "Plato carton 16", label: "Plato cartón pastel 16", basePrice: 4 },
    { id: "Plato carton 12", label: "Plato cartón pastel 12", basePrice: 3 },
    { id: "Vaso postre", label: "Vaso postre tapa redonda", basePrice: 3 },
    {
      id: "Vaso gelatina chico",
      label: "Vaso gelatina tapa plana chico",
      basePrice: 0.5,
    },
    {
      id: "Vaso gelatina grande",
      label: "Vaso gelatina tapa plana grande",
      basePrice: 1,
    },
    {
      id: "Copa margarita",
      label: "Copa margarita vidrio plástico",
      basePrice: 12,
    },
    {
      id: "Domo individual cuadrado",
      label: "Domo individual cuadrado",
      basePrice: 5,
    },
    { id: "Vaso unicel 1L", label: "Vaso unicel 1 L", basePrice: 1.8 },
    { id: "Ninguno", label: "Ninguno", basePrice: 0 },
  ] as CakeItem[],
};
