// core/helpers/finanzasFiltros.ts
//
// Helpers puros (sin dependencias de servidor, usables en cliente y API) para:
//  - los filtros de los dashboards de finanzas (marcadas / tipo / línea)
//  - clasificar un item de orden por tipo de producto y línea
//  - descomponer un item en venta / insumos / servicios / mano de obra / utilidad
//    (misma regla que usa el PATCH de órdenes al generar el registro de venta)

import type {
  CategoriaProducto,
  LineaProducto,
} from "@/modules/admin/store/domain/entities/Producto.entity";

// ── Filtros ───────────────────────────────────────────────────────────────────

export type FiltroFinanzas = "todas" | "si" | "no";
export type TipoProducto = CategoriaProducto | "otro";

export interface FinanzasFiltros {
  finanzas: FiltroFinanzas;
  tipo?: TipoProducto;
  linea?: LineaProducto;
}

export const FILTROS_VACIOS: FinanzasFiltros = { finanzas: "todas" };

export const TIPOS_PRODUCTO: { value: TipoProducto; label: string }[] = [
  { value: "pastel", label: "Pastel" },
  { value: "dessert", label: "Postre" },
  { value: "cookie", label: "Cookie" },
  { value: "gelatina", label: "Gelatina" },
  { value: "otro", label: "Otro" },
];

export const LINEAS_PRODUCTO: { value: LineaProducto; label: string }[] = [
  { value: "sweet", label: "Sweet" },
  { value: "fitness", label: "Fitness" },
  { value: "healthy", label: "Healthy" },
];

const TIPOS_VALIDOS = new Set<string>(TIPOS_PRODUCTO.map((t) => t.value));
const LINEAS_VALIDAS = new Set<string>(LINEAS_PRODUCTO.map((l) => l.value));

/** Hay filtro de tipo o línea (los que obligan a repartir cada venta por producto). */
export function hayFiltroProducto(f: FinanzasFiltros): boolean {
  return Boolean(f.tipo || f.linea);
}

/** Hay algún filtro activo (para mostrar "Limpiar" y el aviso de compras). */
export function hayFiltros(f: FinanzasFiltros): boolean {
  return f.finanzas !== "todas" || hayFiltroProducto(f);
}

export function parseFinanzasFiltros(sp: URLSearchParams): FinanzasFiltros {
  const finanzas = sp.get("finanzas");
  const tipo = sp.get("tipo");
  const linea = sp.get("linea");
  return {
    finanzas: finanzas === "si" || finanzas === "no" ? finanzas : "todas",
    tipo: tipo && TIPOS_VALIDOS.has(tipo) ? (tipo as TipoProducto) : undefined,
    linea: linea && LINEAS_VALIDAS.has(linea) ? (linea as LineaProducto) : undefined,
  };
}

/** Agrega los filtros activos a un URLSearchParams (omite los valores por defecto). */
export function appendFiltrosToParams(
  params: URLSearchParams,
  f: FinanzasFiltros,
): URLSearchParams {
  if (f.finanzas !== "todas") params.set("finanzas", f.finanzas);
  if (f.tipo) params.set("tipo", f.tipo);
  if (f.linea) params.set("linea", f.linea);
  return params;
}

// ── Clasificación de items ────────────────────────────────────────────────────

export interface ProductoClasif {
  categoria: string | null;
  linea: string | null;
}

export interface ItemClasificacion {
  tipo: TipoProducto;
  linea: LineaProducto | null;
}

/**
 * Tipo y línea de un item de orden a partir de su `configuracion`:
 *  - producto de catálogo (`productoId`): categoría y línea del producto;
 *  - pastel personalizado (`bizcochoId` / `pastel-custom`): pastel, sin línea;
 *  - gelatina personalizada (`gelatina` / `gelatina-custom`): gelatina, sin línea;
 *  - cualquier otra partida (línea manual): "otro", sin línea.
 */
export function clasificarItem(
  configuracion: Record<string, any> | null | undefined,
  productos: Map<string, ProductoClasif>,
): ItemClasificacion {
  const conf = configuracion ?? {};
  const productoId = conf.productoId as string | undefined;

  if (productoId) {
    const prod = productos.get(productoId);
    const categoria = prod?.categoria;
    const linea = prod?.linea;
    return {
      tipo:
        categoria && TIPOS_VALIDOS.has(categoria)
          ? (categoria as TipoProducto)
          : "otro",
      linea: linea && LINEAS_VALIDAS.has(linea) ? (linea as LineaProducto) : null,
    };
  }
  if (conf.bizcochoId || conf.tipo === "pastel-custom")
    return { tipo: "pastel", linea: null };
  if (conf.tipo === "gelatina" || conf.tipo === "gelatina-custom")
    return { tipo: "gelatina", linea: null };
  return { tipo: "otro", linea: null };
}

export function itemCoincide(
  c: ItemClasificacion,
  f: Pick<FinanzasFiltros, "tipo" | "linea">,
): boolean {
  if (f.tipo && c.tipo !== f.tipo) return false;
  if (f.linea && c.linea !== f.linea) return false;
  return true;
}

// ── Desglose de un item ───────────────────────────────────────────────────────

export interface DesgloseItem {
  venta: number;
  insumos: number;
  servicios: number;
  manoDeObra: number;
  utilidad: number;
}

/**
 * Venta / insumos / servicios / mano de obra / utilidad de un item.
 * Con `desgloseCostos`: insumos = costoInsumos y servicios/MO/utilidad salen de
 * `cargosAdicionales[0..2]` (por cantidad). Sin desglose: reparto fijo
 * 55/8/10/27 sobre costoUnitario × cantidad. Es la regla que ya usa el PATCH de
 * órdenes al crear el registro de venta.
 */
export function desgloseItem(item: {
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
  desgloseCostos?: Record<string, any> | null;
}): DesgloseItem {
  const d = item.desgloseCostos;
  if (!d) {
    const costo = item.costoUnitario * item.cantidad;
    return {
      venta: item.subtotal,
      insumos: costo * 0.55,
      servicios: costo * 0.08,
      manoDeObra: costo * 0.1,
      utilidad: costo * 0.27,
    };
  }
  const cargos = (d.cargosAdicionales ?? []) as Array<{ monto: number }>;
  return {
    venta: item.subtotal,
    insumos: (d.costoInsumos ?? 0) * item.cantidad,
    servicios: (cargos[0]?.monto ?? 0) * item.cantidad,
    manoDeObra: (cargos[1]?.monto ?? 0) * item.cantidad,
    utilidad: (cargos[2]?.monto ?? 0) * item.cantidad,
  };
}

export function sumarDesgloses(items: DesgloseItem[]): DesgloseItem {
  return items.reduce(
    (a, d) => ({
      venta: a.venta + d.venta,
      insumos: a.insumos + d.insumos,
      servicios: a.servicios + d.servicios,
      manoDeObra: a.manoDeObra + d.manoDeObra,
      utilidad: a.utilidad + d.utilidad,
    }),
    { venta: 0, insumos: 0, servicios: 0, manoDeObra: 0, utilidad: 0 },
  );
}

/** a / b, con 0 cuando b = 0 (evita NaN al repartir). */
export function fraccion(a: number, b: number): number {
  return b > 0 ? a / b : 0;
}
