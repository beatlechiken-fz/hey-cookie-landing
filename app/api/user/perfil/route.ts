// GET  /api/user/perfil — devuelve nombre y email del usuario autenticado
// PATCH /api/user/perfil — actualiza nombre y/o contraseña

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  return NextResponse.json({
    nombre: session.user.name ?? "",
    email: session.user.email ?? "",
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { nombre, passwordActual, passwordNuevo } = await req.json() as {
      nombre?: string;
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

    if (nombre?.trim()) {
      await db.from("user_accounts").update({ name: nombre.trim() }).eq("email", email);
      await db.from("clientes").update({ nombre: nombre.trim() }).eq("email", email);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
