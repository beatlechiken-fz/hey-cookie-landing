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
    .select("id, fecha, monto, created_at")
    .eq("orden_id", id)
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    (data ?? []).map((r: any) => ({
      id: r.id,
      fecha: r.fecha,
      monto: Number(r.monto),
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
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("orden_pagos")
    .insert({ orden_id: id, fecha, monto })
    .select("id, fecha, monto, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    { id: data.id, fecha: data.fecha, monto: Number(data.monto), createdAt: data.created_at },
    { status: 201 },
  );
}
