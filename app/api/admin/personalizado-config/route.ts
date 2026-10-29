// src/app/api/admin/personalizado-config/route.ts
// GET — catálogo para el configurador de "Armado personalizado": insumos
// sueltos (todos los ingredientes activos), coberturas, sabores de cobertura,
// toppings y empaques. Sin bizcochos, gelatinas, jarabes, licores ni ornamentos.

import { NextResponse } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type { PersonalizadoCatalogo } from "@/modules/admin/store/domain/entities/Personalizado.entity";

export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const db = getSupabaseAdmin();

    const [
      { data: insumos, error: e1 },
      { data: coberturas, error: e2 },
      { data: sabCobertura, error: e3 },
      { data: toppingCants, error: e4 },
      { data: empaques, error: e5 },
    ] = await Promise.all([
      db
        .from("ingredientes")
        .select("id, nombre, unidad_base, costo_unidad_minima, categoria")
        .eq("activo", true)
        .order("nombre"),
      db
        .from("coberturas")
        .select("id, nombre, costo_total")
        .eq("activo", true)
        .order("nombre"),
      db
        .from("sabores")
        .select("id, nombre, precio")
        .eq("activo", true)
        .order("nombre"),
      db
        .from("topping_cantidades")
        .select(
          "ingrediente_id, cantidad, unidad, ingredientes(nombre, unidad_base, costo_unidad_minima, activo)",
        ),
      db
        .from("empaques")
        .select("id, nombre, precio, imagen_url")
        .eq("activo", true)
        .order("nombre"),
    ]);

    const firstError = [e1, e2, e3, e4, e5].find(Boolean);
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
      }))
      .sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));

    const catalogo: PersonalizadoCatalogo = {
      insumos: (insumos ?? []).map((i: any) => ({
        id: i.id,
        nombre: i.nombre,
        unidadBase: i.unidad_base,
        costoUnidadMinima:
          i.costo_unidad_minima != null ? Number(i.costo_unidad_minima) : null,
        categoria: i.categoria ?? null,
      })),
      // Sin bizcocho/gelatina en este configurador — el catálogo compartido
      // (PastelConfigCatalogo) los requiere en el tipo, van vacíos.
      bizcochos: [],
      coberturas: (coberturas ?? []).map((c: any) => ({
        id: c.id,
        nombre: c.nombre,
        costoTotal: Number(c.costo_total ?? 0),
      })),
      saboresCobertura: (sabCobertura ?? []).map((s: any) => ({
        id: s.id,
        nombre: s.nombre,
        precio: s.precio != null ? Number(s.precio) : null,
      })),
      jarabes: [],
      saboresJarabe: [],
      toppings,
      licores: [],
      empaques: (empaques ?? []).map((e: any) => ({
        id: e.id,
        nombre: e.nombre,
        precio: Number(e.precio),
        imagenUrl: e.imagen_url ?? null,
      })),
      ornamentos: [],
    };

    return NextResponse.json(catalogo);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
