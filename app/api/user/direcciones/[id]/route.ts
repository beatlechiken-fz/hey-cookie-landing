import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";

type Ctx = { params: Promise<{ id: string }> };

async function ownsAddress(db: ReturnType<typeof getSupabaseAdmin>, addressId: string, email: string) {
  const { data: cliente } = await db.from("clientes").select("id").eq("email", email).maybeSingle();
  if (!cliente) return false;
  const { data } = await db
    .from("cliente_direcciones")
    .select("id")
    .eq("id", addressId)
    .eq("cliente_id", cliente.id)
    .maybeSingle();
  return !!data;
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const db = getSupabaseAdmin();

  if (!(await ownsAddress(db, id, session.user.email ?? ""))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { alias, calle, colonia, ciudad, cp, referencias } = await req.json();

  if (!calle?.trim()) return NextResponse.json({ error: "La calle es requerida" }, { status: 400 });

  const { data, error } = await db
    .from("cliente_direcciones")
    .update({
      alias: alias?.trim() || "Mi dirección",
      calle: calle.trim(),
      colonia: colonia?.trim() || null,
      ciudad: ciudad?.trim() || null,
      cp: cp?.trim() || null,
      referencias: referencias?.trim() || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const db = getSupabaseAdmin();

  if (!(await ownsAddress(db, id, session.user.email ?? ""))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { error } = await db.from("cliente_direcciones").update({ activo: false }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
