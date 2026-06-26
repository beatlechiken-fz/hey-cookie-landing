// src/lib/supabase.ts
// Dos clientes: uno para el navegador (anon key) y otro para el servidor (service_role)

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ── Cliente público (navegador / componentes cliente) ──────────────────────
// Solo usa la anon key; RLS controla el acceso
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// ── Cliente administrador (solo servidor) ──────────────────────────────────
// Usa service_role key → bypasea RLS → NUNCA usar en componentes cliente
let _adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no está definida");
  }

  _adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  return _adminClient;
}
