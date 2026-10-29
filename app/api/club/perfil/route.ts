import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const db = getSupabaseAdmin();
  const email = session.user.email ?? "";

  const { data: cliente } = await db
    .from("clientes")
    .select("nombre, telefono")
    .eq("email", email)
    .maybeSingle();

  return NextResponse.json({
    nombre: cliente?.nombre ?? session.user.name ?? "",
    email,
    telefono: cliente?.telefono ?? "",
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { nombre, telefono, passwordActual, passwordNuevo } = await req.json() as {
      nombre?: string;
      telefono?: string;
      passwordActual?: string;
      passwordNuevo?: string;
    };

    const db = getSupabaseAdmin();
    const email = session.user.email ?? "";

    if (passwordNuevo) {
      if (!passwordActual) {
        return NextResponse.json({ error: "Ingresa tu contraseña actual" }, { status: 400 });
      }
      if (passwordNuevo.length < 8) {
        return NextResponse.json({ error: "La nueva contraseña debe tener al menos 8 caracteres" }, { status: 400 });
      }

      const { data: user, error: ue } = await db
        .from("user_accounts")
        .select("password_hash")
        .eq("email", email)
        .single();

      if (ue || !user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

      const valid = await bcrypt.compare(passwordActual, user.password_hash);
      if (!valid) return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });

      const hash = await bcrypt.hash(passwordNuevo, 12);
      await db.from("user_accounts").update({ password_hash: hash }).eq("email", email);
    }

    const clienteUpdate: Record<string, string> = {};
    if (nombre?.trim()) clienteUpdate.nombre = nombre.trim();
    if (telefono !== undefined) clienteUpdate.telefono = telefono.trim();

    if (Object.keys(clienteUpdate).length > 0) {
      await db.from("clientes").update(clienteUpdate).eq("email", email);
      if (clienteUpdate.nombre) {
        await db.from("user_accounts").update({ name: clienteUpdate.nombre }).eq("email", email);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
