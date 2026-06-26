import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { FinanzasDatasource } from "@/modules/admin/store/data/datasources/Finanzas.datasource";

const ds = new FinanzasDatasource();

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { searchParams } = req.nextUrl;
    const hoy = new Date().toISOString().slice(0, 10);
    const anio = hoy.slice(0, 4);
    const desde = searchParams.get("desde") ?? `${anio}-01-01`;
    const hasta = searchParams.get("hasta") ?? hoy;
    return NextResponse.json(await ds.getResumen(desde, hasta));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
