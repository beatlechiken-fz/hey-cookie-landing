// GET /api/public/config-personalizado
// Catálogo completo para el configurador público de pasteles y gelatinas personalizados.
// Sin autenticación requerida.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type { PastelConfigCatalogo } from "@/modules/admin/store/domain/entities/PastelPersonalizado.entity";
import type { GelatinaCatalogo } from "@/modules/admin/store/domain/entities/GelatinaCotizador.entity";

export interface ConfigPersonalizadoCatalogo extends PastelConfigCatalogo {
  gelatinas: GelatinaCatalogo[];
}

export async function GET() {
  try {
    const db = getSupabaseAdmin();

    const [
      { data: bizcochos,   error: e1 },
      { data: coberturas,  error: e2 },
      { data: sabCob,      error: e3 },
      { data: jarabes,     error: e4 },
      { data: sabJar,      error: e5 },
      { data: toppingCants,error: e6 },
      { data: licorIngs,   error: e7 },
      { data: licorCants,  error: e8 },
      { data: empaques,    error: e9 },
      { data: gelatinas,   error: e10 },
    ] = await Promise.all([
      db.from("bizcochos").select("id, nombre, costo_total, imagen_url").eq("activo", true).order("nombre"),
      db.from("coberturas").select("id, nombre, costo_total, imagen_url").eq("activo", true).order("nombre"),
      db.from("sabores").select("id, nombre, precio").eq("activo", true).order("nombre"),
      db.from("jarabes").select("id, nombre, costo_total, imagen_url").eq("activo", true).order("nombre"),
      db.from("sabores_jarabe").select("id, nombre, precio").eq("activo", true).order("nombre"),
      db.from("topping_cantidades").select(
        "ingrediente_id, cantidad, unidad, ingredientes(nombre, unidad_base, costo_unidad_minima, activo, imagen_url)",
      ),
      db.from("ingredientes").select("id, nombre, unidad_base, costo_unidad_minima, imagen_url")
        .eq("categoria", "licores_bebidas").eq("activo", true).order("nombre"),
      db.from("licor_cantidades").select("ingrediente_id, cantidad"),
      db.from("empaques").select("id, nombre, precio, imagen_url").eq("activo", true).order("nombre"),
      db.from("gelatinas").select("id, nombre, descripcion, elaboracion, costo_total_leche, costo_total_agua, tiene_base_leche, tiene_base_agua, activo")
        .eq("activo", true).order("nombre"),
    ]);

    const firstErr = [e1,e2,e3,e4,e5,e6,e7,e8,e9,e10].find(Boolean);
    if (firstErr) throw new Error(firstErr.message);

    const toppings = (toppingCants ?? [])
      .filter((t: any) => t.ingredientes?.activo)
      .map((t: any) => ({
        ingredienteId: t.ingrediente_id,
        nombre: t.ingredientes?.nombre ?? "",
        cantidad: t.cantidad != null ? Number(t.cantidad) : null,
        unidad: t.unidad ?? t.ingredientes?.unidad_base ?? "",
        costoUnidadMinima: t.ingredientes?.costo_unidad_minima != null
          ? Number(t.ingredientes.costo_unidad_minima) : null,
        imagenUrl: t.ingredientes?.imagen_url ?? null,
      }));

    const cantMap = Object.fromEntries(
      (licorCants ?? []).map((c: any) => [c.ingrediente_id, c.cantidad]),
    );
    const licores = (licorIngs ?? []).map((ing: any) => ({
      ingredienteId: ing.id,
      nombre: ing.nombre,
      cantidad: cantMap[ing.id] != null ? Number(cantMap[ing.id]) : null,
      costoUnidadMinima: ing.costo_unidad_minima != null ? Number(ing.costo_unidad_minima) : null,
      imagenUrl: ing.imagen_url ?? null,
    }));

    const catalogo: ConfigPersonalizadoCatalogo = {
      bizcochos: (bizcochos ?? []).map((b: any) => ({
        id: b.id, nombre: b.nombre, costoTotal: Number(b.costo_total ?? 0), imagenUrl: b.imagen_url ?? null,
      })),
      coberturas: (coberturas ?? []).map((c: any) => ({
        id: c.id, nombre: c.nombre, costoTotal: Number(c.costo_total ?? 0), imagenUrl: c.imagen_url ?? null,
      })),
      saboresCobertura: (sabCob ?? []).map((s: any) => ({
        id: s.id, nombre: s.nombre, precio: s.precio != null ? Number(s.precio) : null,
      })),
      jarabes: (jarabes ?? []).map((j: any) => ({
        id: j.id, nombre: j.nombre, costoTotal: Number(j.costo_total ?? 0), imagenUrl: j.imagen_url ?? null,
      })),
      saboresJarabe: (sabJar ?? []).map((s: any) => ({
        id: s.id, nombre: s.nombre, precio: s.precio != null ? Number(s.precio) : null,
      })),
      toppings,
      licores,
      empaques: (empaques ?? []).map((e: any) => ({
        id: e.id, nombre: e.nombre, precio: Number(e.precio), imagenUrl: e.imagen_url ?? null,
      })),
      gelatinas: (gelatinas ?? []).map((g: any) => ({
        id: g.id,
        nombre: g.nombre,
        descripcion: g.descripcion ?? null,
        elaboracion: g.elaboracion ?? null,
        costoTotalLeche: Number(g.costo_total_leche ?? 0),
        costoTotalAgua: Number(g.costo_total_agua ?? 0),
        tieneBaseLeche: g.tiene_base_leche ?? false,
        tieneBaseAgua: g.tiene_base_agua ?? false,
        activo: g.activo,
      })),
    };

    return NextResponse.json(catalogo);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
