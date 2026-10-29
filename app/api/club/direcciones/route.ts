import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";

async function resolveClienteId(db: ReturnType<typeof getSupabaseAdmin>, session: Awaited<ReturnType<typeof getUserSession>>) {
  if (!session) return null;
  const email = session.user.email ?? "";

  let { data: cliente } = await db
    .from("clientes")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!cliente) {
    const { data: nuevo } = await db
      .from("clientes")
      .insert({ nombre: session.user.name ?? "Cliente", email })
      .select("id")
      .single();
    cliente = nuevo;
  }
  return cliente?.id ?? null;
}

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const db = getSupabaseAdmin();
  const clienteId = await resolveClienteId(db, session);
  if (!clienteId) return NextResponse.json({ direcciones: [] });

  const { data, error } = await db
    .from("cliente_direcciones")
    .select("*")
    .eq("cliente_id", clienteId)
    .eq("activo", true)
    .order("predeterminada", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ direcciones: data ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const db = getSupabaseAdmin();
  const clienteId = await resolveClienteId(db, session);
  if (!clienteId) return NextResponse.json({ error: "No se pudo identificar el cliente" }, { status: 400 });

  const body = await req.json();
  const { alias, calle, colonia, ciudad, cp, referencias } = body;

  if (!calle?.trim()) {
    return NextResponse.json({ error: "La calle es requerida" }, { status: 400 });
  }

  const { data, error } = await db
    .from("cliente_direcciones")
    .insert({
      cliente_id: clienteId,
      alias: alias?.trim() || "Mi dirección",
      calle: calle.trim(),
      colonia: colonia?.trim() || null,
      ciudad: ciudad?.trim() || null,
      cp: cp?.trim() || null,
      referencias: referencias?.trim() || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
