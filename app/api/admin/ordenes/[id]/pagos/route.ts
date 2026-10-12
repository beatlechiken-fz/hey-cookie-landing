import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("orden_pagos")
    .select("id, fecha, monto, observaciones, participante_id, created_at")
    .eq("orden_id", id)
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    (data ?? []).map((r: any) => ({
      id: r.id,
      fecha: r.fecha,
      monto: Number(r.monto),
      observaciones: r.observaciones ?? null,
      participanteId: r.participante_id ?? null,
      createdAt: r.created_at,
    })),
  );
}

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const monto = Number(body.monto);
  if (!monto || monto <= 0)
    return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
  const fecha: string = body.fecha ?? new Date().toISOString().slice(0, 10);
  if (body.observaciones != null && typeof body.observaciones !== "string")
    return NextResponse.json({ error: "Observación inválida" }, { status: 400 });
  const observaciones: string | null = body.observaciones?.trim() || null;
  if (observaciones && observaciones.length > 500)
    return NextResponse.json(
      { error: "La observación no puede pasar de 500 caracteres" },
      { status: 400 },
    );
  // Pago de un participante de un pastel compartido (opcional).
  const participanteId: string | null =
    typeof body.participanteId === "string" ? body.participanteId : null;
  const db = getSupabaseAdmin();
  if (participanteId) {
    const { data: part } = await db
      .from("pastel_participantes")
      .select("id, pastel_compartido!inner(orden_id)")
      .eq("id", participanteId)
      .maybeSingle();
    const embebido = part as unknown as { pastel_compartido?: { orden_id?: string } | null } | null;
    if (!embebido || embebido.pastel_compartido?.orden_id !== id)
      return NextResponse.json({ error: "Participante inválido" }, { status: 400 });
  }
  const { data, error } = await db
    .from("orden_pagos")
    .insert({ orden_id: id, fecha, monto, observaciones, participante_id: participanteId })
    .select("id, fecha, monto, observaciones, participante_id, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    {
      id: data.id,
      fecha: data.fecha,
      monto: Number(data.monto),
      observaciones: data.observaciones ?? null,
      participanteId: data.participante_id ?? null,
      createdAt: data.created_at,
    },
    { status: 201 },
  );
}
