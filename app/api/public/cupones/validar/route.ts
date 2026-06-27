// Validación pública de cupones — solo cupones globales, sin sesión requerida.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import {
  calcularDescuentoCupon,
  validarCupon,
  type Cupon,
} from "@/modules/admin/store/domain/entities/Cupon.entity";

function toEntity(row: any): Cupon {
  return {
    id: row.id,
    codigo: row.codigo,
    descripcion: row.descripcion ?? null,
    tipo: row.tipo,
    tipoDescuento: row.tipo_descuento,
    valor: Number(row.valor),
    usosMaximos: row.usos_maximos ?? null,
    usosActuales: row.usos_actuales ?? 0,
    fechaInicio: row.fecha_inicio ?? null,
    fechaFin: row.fecha_fin ?? null,
    activo: row.activo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { codigo, subtotal } = await req.json();

    if (!codigo || typeof subtotal !== "number") {
      return NextResponse.json(
        { error: "codigo y subtotal son requeridos" },
        { status: 400 },
      );
    }

    const { data, error } = await getSupabaseAdmin()
      .from("cupones")
      .select("*")
      .eq("codigo", String(codigo).toUpperCase().trim())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Cupón no encontrado" },
        { status: 404 },
      );
    }

    const cupon = toEntity(data);

    if (cupon.tipo !== "global") {
      return NextResponse.json(
        { error: "Este cupón es exclusivo para clientes registrados" },
        { status: 403 },
      );
    }

    const { valido, razon } = validarCupon(cupon);
    if (!valido) {
      return NextResponse.json({ error: razon }, { status: 400 });
    }

    return NextResponse.json({
      cupon,
      montoDescontado: calcularDescuentoCupon(cupon, subtotal),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
