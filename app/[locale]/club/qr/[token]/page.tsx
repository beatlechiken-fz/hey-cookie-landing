// Página pública de aterrizaje del QR de la tarjeta del club de cada cliente.
// Resuelve a dónde mandar al cliente: si ya hay sesión activa, directo al
// panel; si no, a login (prellenado) si ya tiene cuenta, o a registro
// (prellenado) si todavía no.

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getUserSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";

export const metadata = { robots: "noindex, nofollow" };

export default async function ClubQrPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [{ token }, locale, session] = await Promise.all([
    params,
    getLocale(),
    getUserSession(),
  ]);

  // Ya hay una sesión de cliente activa en este navegador → directo al panel.
  if (session) {
    redirect(`/${locale}/club/dashboard`);
  }

  const db = getSupabaseAdmin();
  const { data: cliente } = await db
    .from("clientes")
    .select("nombre, email, telefono")
    .eq("qr_token", token)
    .maybeSingle();

  if (!cliente) {
    redirect(`/${locale}/club/qr-invalido`);
  }

  const email = cliente.email?.trim() ?? "";

  if (email) {
    const { data: cuenta } = await db
      .from("user_accounts")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (cuenta) {
      redirect(`/${locale}/club/login?email=${encodeURIComponent(email)}`);
    }
  }

  const qp = new URLSearchParams();
  if (cliente.nombre) qp.set("nombre", cliente.nombre);
  if (email) qp.set("email", email);
  if (cliente.telefono) qp.set("telefono", cliente.telefono);
  redirect(`/${locale}/club/signin?${qp.toString()}`);
}
