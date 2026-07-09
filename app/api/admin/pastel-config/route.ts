// src/app/api/admin/pastel-config/route.ts
// GET — agrega catálogo de bizcochos, coberturas, sabores, jarabes, toppings,
// licores y empaques para alimentar el configurador de "Pastel personalizado"

import { NextResponse } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type { PastelConfigCatalogo } from "@/modules/admin/store/domain/entities/PastelPersonalizado.entity";

export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const db = getSupabaseAdmin();

    const [
      { data: bizcochos, error: e1 },
      { data: coberturas, error: e2 },
      { data: sabCobertura, error: e3 },
      { data: jarabes, error: e4 },
      { data: sabJarabe, error: e5 },
      { data: toppingCants, error: e6 },
      { data: licorIngs, error: e7 },
      { data: licorCants, error: e8 },
      { data: empaques, error: e9 },
    ] = await Promise.all([
      db
        .from("bizcochos")
        .select("id, nombre, costo_total")
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
        .from("jarabes")
        .select("id, nombre, costo_total")
        .eq("activo", true)
        .order("nombre"),
      db
        .from("sabores_jarabe")
        .select("id, nombre, precio")
        .eq("activo", true)
        .order("nombre"),
      db
        .from("topping_cantidades")
        .select(
          "ingrediente_id, cantidad, unidad, ingredientes(nombre, unidad_base, costo_unidad_minima, activo)",
        ),
      db
        .from("ingredientes")
        .select("id, nombre, unidad_base, costo_unidad_minima")
        .eq("categoria", "licores_bebidas")
        .eq("activo", true)
        .order("nombre"),
      db.from("licor_cantidades").select("ingrediente_id, cantidad"),
      db
        .from("empaques")
        .select("id, nombre, precio, imagen_url")
        .eq("activo", true)
        .order("nombre"),
    ]);

    const firstError = [e1, e2, e3, e4, e5, e6, e7, e8, e9].find(Boolean);
    if (firstError) throw new Error(firstError.message);

    // Toppings: join manual entre topping_cantidades + ingredientes (solo activos)
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

    // Licores: todos los ingredientes de categoría licores_bebidas + su cantidad si existe
    const cantMap = Object.fromEntries(
      (licorCants ?? []).map((c: any) => [c.ingrediente_id, c.cantidad]),
    );
    const licores = (licorIngs ?? []).map((ing: any) => ({
      ingredienteId: ing.id,
      nombre: ing.nombre,
      cantidad: cantMap[ing.id] != null ? Number(cantMap[ing.id]) : null,
      costoUnidadMinima:
        ing.costo_unidad_minima != null
          ? Number(ing.costo_unidad_minima)
          : null,
    }));

    const catalogo: PastelConfigCatalogo = {
      bizcochos: (bizcochos ?? []).map((b: any) => ({
        id: b.id,
        nombre: b.nombre,
        costoTotal: Number(b.costo_total ?? 0),
      })),
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
      jarabes: (jarabes ?? []).map((j: any) => ({
        id: j.id,
        nombre: j.nombre,
        costoTotal: Number(j.costo_total ?? 0),
      })),
      saboresJarabe: (sabJarabe ?? []).map((s: any) => ({
        id: s.id,
        nombre: s.nombre,
        precio: s.precio != null ? Number(s.precio) : null,
      })),
      toppings,
      licores,
      empaques: (empaques ?? []).map((e: any) => ({
        id: e.id,
        nombre: e.nombre,
        precio: Number(e.precio),
        imagenUrl: e.imagen_url ?? null,
      })),
    };

    return NextResponse.json(catalogo);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
