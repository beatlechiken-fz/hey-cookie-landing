// src/app/api/admin/ordenes/[id]/comanda/route.ts
// GET — Devuelve la orden enriquecida con ingredientes reales para la comanda PDF.
//
// NOTAS sobre esquema:
//   cobertura_ingredientes, bizcocho_ingredientes, jarabe_ingredientes:
//     columnas: (id, cobertura_id/bizcocho_id/jarabe_id, ingrediente_id, cantidad, costo_calculado)
//     SIN columna "unidad" — la unidad viene de ingredientes.unidad_base
//
//   Las cantidades en BD están a medida base 24cm (o medidaBaseCm del producto).
//   Se escalan con: factor = (diametroCm / medidaBaseCm)²  × qty (nº de piezas)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";

type Ctx = { params: Promise<{ id: string }> };

export interface IngredienteComanda {
  nombre: string;
  cantidad: number;
  unidad: string;
}
export interface SeccionComanda {
  titulo: string;
  ingredientes: IngredienteComanda[];
  procedimiento?: string | null;
  nota?: string | null;
}
export interface ItemComanda {
  nombre: string;
  cantidad: number;
  diametroCm: number | null;
  factorVolumen: number;
  secciones: SeccionComanda[];
}
export interface ComandaData {
  ordenId: string;
  numero: number;
  clienteNombre: string | null;
  fechaEntrega: string | null;
  createdAt: string;
  items: ItemComanda[];
}

/** Redondea a 2 decimales */
function r2(n: number) {
  return Math.round(n * 100) / 100;
}

/** Factor de volumen: (diámetroSolicitado / base)² */
function factorVol(diametroCm: number, baseCm: number): number {
  if (!diametroCm || !baseCm || baseCm === 0) return 1;
  return Math.pow(diametroCm / baseCm, 2);
}

/**
 * Convierte filas de *_ingredientes (join aliasado "ingrediente:ingredientes(...)").
 * Aplica factor = factorVolumen × qty (piezas pedidas).
 */
function ingRowsFromJoin(arr: unknown[], scale: number): IngredienteComanda[] {
  return (arr as any[])
    .map((r: any) => ({
      nombre: r.ingrediente?.nombre ?? "?",
      cantidad: r2(Number(r.cantidad) * scale),
      unidad: r.ingrediente?.unidad_base ?? "gr",
    }))
    .filter((r) => r.nombre !== "?");
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const db = getSupabaseAdmin();

    const { data: orden, error: oe } = await db
      .from("ordenes")
      .select("*, clientes(nombre), orden_items(*)")
      .eq("id", id)
      .single();
    if (oe) throw new Error(oe.message);
    if (!orden)
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 },
      );

    const [
      { data: bizcochos },
      { data: coberturas },
      { data: sabores },
      { data: jarabes },
      { data: saboresJarabe },
      { data: empaques },
      { data: productos },
      { data: toppingCants },
      { data: licorCants },
    ] = await Promise.all([
      db.from("bizcochos").select(`id, nombre, elaboracion,
        ingredientes:bizcocho_ingredientes (cantidad, ingrediente:ingredientes (id, nombre, unidad_base))`),
      db.from("coberturas").select(`id, nombre, elaboracion,
        ingredientes:cobertura_ingredientes (cantidad, ingrediente:ingredientes (id, nombre, unidad_base))`),
      db.from("sabores").select("id, nombre"),
      db.from("jarabes").select(`id, nombre, elaboracion,
        ingredientes:jarabe_ingredientes (cantidad, ingrediente:ingredientes (id, nombre, unidad_base))`),
      db.from("sabores_jarabe").select("id, nombre"),
      db.from("empaques").select("id, nombre"),
      db
        .from("productos")
        .select("id, nombre, ingredientes_base, elaboracion, medida_base_cm"),
      db.from("topping_cantidades").select(`ingrediente_id, cantidad, unidad,
        ingrediente:ingredientes (id, nombre, unidad_base)`),
      db.from("licor_cantidades").select(`ingrediente_id, cantidad,
        ingrediente:ingredientes (id, nombre)`),
    ]);

    const byId = (
      arr: unknown[] | null,
      sid: string | null | undefined,
    ): any =>
      !sid ? undefined : ((arr as any[]) ?? []).find((x: any) => x.id === sid);

    const comandaItems: ItemComanda[] = [];

    for (const item of (orden.orden_items as any[]) ?? []) {
      const conf = (item.configuracion ?? {}) as Record<string, any>;
      const qty = Number(item.cantidad ?? 1);
      const opciones = conf.opciones ?? conf; // productos usan conf.opciones; pastel usa conf

      // ── Calcular factor de volumen ─────────────────────────────────────────
      // Para productos del catálogo: medidaBaseCm viene del producto en BD
      // Para pastel personalizado: base es siempre 24cm
      let medidaBaseCm = 24;
      if (conf.productoId) {
        const prod = byId(productos, conf.productoId);
        medidaBaseCm = prod?.medida_base_cm ? Number(prod.medida_base_cm) : 24;
      }

      const diametroCm = conf.diametroCm ? Number(conf.diametroCm) : null;

      // Si no tiene medida personalizada (tamaño único o tamaño fijo), factor = 1
      // Si tiene diámetro seleccionado, escalar proporcionalmente
      const fVol = diametroCm ? factorVol(diametroCm, medidaBaseCm) : 1;

      // Factor total = factor de volumen × número de piezas pedidas
      const scale = fVol * qty;

      const secciones: SeccionComanda[] = [];

      // ── Receta base — producto del catálogo ──────────────────────────────
      if (conf.productoId) {
        const prod = byId(productos, conf.productoId);
        if (prod) {
          secciones.push({
            titulo: "Receta Base",
            ingredientes: ((prod.ingredientes_base ?? []) as any[]).map(
              (ing: any) => ({
                nombre: ing.nombre,
                cantidad: r2(Number(ing.cantidad) * scale),
                unidad: ing.unidad,
              }),
            ),
            procedimiento: prod.elaboracion ?? null,
          });
        }
      }

      // ── Bizcocho — pastel personalizado ──────────────────────────────────
      if (opciones.bizcochoId) {
        const biz = byId(bizcochos, opciones.bizcochoId);
        if (biz)
          secciones.push({
            titulo: `Bizcocho: ${biz.nombre}`,
            ingredientes: ingRowsFromJoin(biz.ingredientes ?? [], scale),
            procedimiento: biz.elaboracion ?? null,
          });
      }

      // ── Cobertura ─────────────────────────────────────────────────────────
      if (opciones.coberturaId) {
        const cob = byId(coberturas, opciones.coberturaId);
        const sab = byId(sabores, opciones.saborCoberturaId);
        if (cob)
          secciones.push({
            titulo: `Cobertura: ${cob.nombre}`,
            ingredientes: ingRowsFromJoin(cob.ingredientes ?? [], scale),
            procedimiento: cob.elaboracion ?? null,
            nota: sab ? `Sabor: ${sab.nombre}` : null,
          });
      }

      // ── Relleno ───────────────────────────────────────────────────────────
      if (opciones.rellenoId) {
        const rel = byId(coberturas, opciones.rellenoId);
        const sab = byId(sabores, opciones.saborRellenoId);
        if (rel)
          secciones.push({
            titulo: `Relleno: ${rel.nombre}`,
            ingredientes: ingRowsFromJoin(rel.ingredientes ?? [], scale),
            procedimiento: rel.elaboracion ?? null,
            nota: sab ? `Sabor: ${sab.nombre}` : null,
          });
      }

      // ── Jarabe ────────────────────────────────────────────────────────────
      if (opciones.jarabeId) {
        const jar = byId(jarabes, opciones.jarabeId);
        const sab = byId(saboresJarabe, opciones.saborJarabeId);
        const esHumedo = opciones.humedadJarabe === "humedo";
        // Húmedo: todas las cantidades del jarabe ×2.2 sobre el scale ya aplicado
        const scaleJarabe = esHumedo ? scale * 2.2 : scale;
        const etiquetaHumedad = esHumedo ? "Húmedo (×2.2)" : "Semi húmedo";
        if (jar)
          secciones.push({
            titulo: `Jarabe: ${jar.nombre}`,
            ingredientes: ingRowsFromJoin(jar.ingredientes ?? [], scaleJarabe),
            procedimiento: jar.elaboracion ?? null,
            nota: [sab ? `Sabor: ${sab.nombre}` : null, etiquetaHumedad]
              .filter(Boolean)
              .join(" · "),
          });
      }

      // ── Toppings (escalan igual que ingredientes base) ────────────────────
      const toppingIds: string[] = opciones.toppingIds ?? [];
      const toppingIns: IngredienteComanda[] = toppingIds
        .filter((t) => t && t !== "ninguno")
        .flatMap((tid) => {
          const tc = ((toppingCants as any[]) ?? []).find(
            (t: any) => t.ingrediente_id === tid,
          );
          if (!tc) return [];
          return [
            {
              nombre: tc.ingrediente?.nombre ?? tid,
              cantidad: r2(Number(tc.cantidad) * scale),
              unidad: tc.unidad ?? tc.ingrediente?.unidad_base ?? "gr",
            },
          ];
        });
      if (toppingIns.length > 0)
        secciones.push({ titulo: "Toppings", ingredientes: toppingIns });

      // ── Licor (escala igual) ──────────────────────────────────────────────
      if (opciones.licorId && opciones.licorId !== "ninguno") {
        const lc = ((licorCants as any[]) ?? []).find(
          (l: any) => l.ingrediente_id === opciones.licorId,
        );
        if (lc)
          secciones.push({
            titulo: "Licor",
            ingredientes: [
              {
                nombre: lc.ingrediente?.nombre ?? opciones.licorId,
                cantidad: r2(Number(lc.cantidad) * scale),
                unidad: "ml",
              },
            ],
          });
      }

      // ── Empaques (NO escalan — son unidades físicas × qty de piezas) ─────
      const empaqueIds: string[] = opciones.empaqueIds ?? [];
      const empIns: IngredienteComanda[] = empaqueIds
        .filter((e) => e && e !== "ninguno")
        .flatMap((eid) => {
          const emp = byId(empaques, eid);
          return emp
            ? [{ nombre: emp.nombre, cantidad: qty, unidad: "pieza" }]
            : [];
        });
      if (empIns.length > 0)
        secciones.push({ titulo: "Empaques", ingredientes: empIns });

      comandaItems.push({
        nombre: item.nombre,
        cantidad: qty,
        diametroCm,
        factorVolumen: r2(fVol),
        secciones: secciones.filter((s) => s.ingredientes.length > 0),
      });
    }

    return NextResponse.json({
      ordenId: orden.id,
      numero: Number(orden.numero),
      clienteNombre: (orden.clientes as any)?.nombre ?? null,
      fechaEntrega: orden.fecha_entrega ?? null,
      createdAt: orden.created_at,
      items: comandaItems,
    } satisfies ComandaData);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
