// GET /api/public/pastel-config — catálogo público para el configurador de pasteles.
// Sin autenticación requerida.

import { NextResponse } from "next/server";
import { getPastelConfigCatalogoPublico } from "@/modules/admin/store/data/datasources/PastelConfigPublico.datasource";

export async function GET() {
  try {
    return NextResponse.json(await getPastelConfigCatalogoPublico());
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
