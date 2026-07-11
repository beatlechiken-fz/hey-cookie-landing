// GET /api/public/pastel-config — catálogo público para el configurador de pasteles.
// Sin autenticación requerida.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type { PastelConfigCatalogo } from "@/modules/admin/store/domain/entities/PastelPersonalizado.entity";

export async function GET() {
  try {
    const db = getSupabaseAdmin();

    const [
      { data: coberturas,   error: e1 },
      { data: sabCobertura, error: e2 },
      { data: jarabes,      error: e3 },
      { data: sabJarabe,    error: e4 },
      { data: toppingCants, error: e5 },
      { data: licorIngs,    error: e6 },
      { data: licorCants,   error: e7 },
      { data: empaques,     error: e8 },
    ] = await Promise.all([
      db.from("coberturas").select("id, nombre, costo_total").eq("activo", true).order("nombre"),
      db.from("sabores").select("id, nombre, precio").eq("activo", true).order("nombre"),
      db.from("jarabes").select("id, nombre, costo_total").eq("activo", true).order("nombre"),
      db.from("sabores_jarabe").select("id, nombre, precio").eq("activo", true).order("nombre"),
      db.from("topping_cantidades").select(
        "ingrediente_id, cantidad, unidad, ingredientes(nombre, unidad_base, costo_unidad_minima, activo, imagen_url)",
      ),
      db.from("ingredientes").select("id, nombre, unidad_base, costo_unidad_minima")
        .eq("categoria", "licores_bebidas").eq("activo", true).order("nombre"),
      db.from("licor_cantidades").select("ingrediente_id, cantidad"),
      db.from("empaques").select("id, nombre, precio, imagen_url").eq("activo", true).order("nombre"),
    ]);

    const firstError = [e1, e2, e3, e4, e5, e6, e7, e8].find(Boolean);
    if (firstError) throw new Error(firstError.message);

    const toppings = (toppingCants ?? [])
      .filter((t: any) => t.ingredientes?.activo)
      .map((t: any) => ({
        ingredienteId: t.ingrediente_id,
        nombre: t.ingredientes?.nombre ?? "",
        cantidad: t.cantidad != null ? Number(t.cantidad) : null,
        unidad: t.unidad ?? t.ingredientes?.unidad_base ?? "",
        costoUnidadMinima:
          t.ingredientes?.costo_unidad_minima != null
            ? Number(t.ingredientes.costo_unidad_minima)
            : null,
        imagenUrl: t.ingredientes?.imagen_url ?? null,
      }));

    const cantMap = Object.fromEntries(
      (licorCants ?? []).map((c: any) => [c.ingrediente_id, c.cantidad]),
    );
    const licores = (licorIngs ?? []).map((ing: any) => ({
      ingredienteId: ing.id,
      nombre: ing.nombre,
      cantidad: cantMap[ing.id] != null ? Number(cantMap[ing.id]) : null,
      costoUnidadMinima:
        ing.costo_unidad_minima != null ? Number(ing.costo_unidad_minima) : null,
    }));

    const catalogo: PastelConfigCatalogo = {
      bizcochos: [], // no necesario para productos del catálogo
      coberturas: (coberturas ?? []).map((c: any) => ({
        id: c.id, nombre: c.nombre, costoTotal: Number(c.costo_total ?? 0),
      })),
      saboresCobertura: (sabCobertura ?? []).map((s: any) => ({
        id: s.id, nombre: s.nombre, precio: s.precio != null ? Number(s.precio) : null,
      })),
      jarabes: (jarabes ?? []).map((j: any) => ({
        id: j.id, nombre: j.nombre, costoTotal: Number(j.costo_total ?? 0),
      })),
      saboresJarabe: (sabJarabe ?? []).map((s: any) => ({
        id: s.id, nombre: s.nombre, precio: s.precio != null ? Number(s.precio) : null,
      })),
      toppings,
      licores,
      empaques: (empaques ?? []).map((e: any) => ({
        id: e.id, nombre: e.nombre, precio: Number(e.precio), imagenUrl: e.imagen_url ?? null,
      })),
    };

    return NextResponse.json(catalogo);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
