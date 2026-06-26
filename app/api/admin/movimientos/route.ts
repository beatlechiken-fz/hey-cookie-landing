import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { FinanzasDatasource } from "@/modules/admin/store/data/datasources/Finanzas.datasource";
import type { CuentaMovimiento } from "@/modules/admin/store/domain/entities/Finanzas.entity";

const ds = new FinanzasDatasource();

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { searchParams } = req.nextUrl;
    const data = await ds.getMovimientos(
      searchParams.get("desde") ?? undefined,
      searchParams.get("hasta") ?? undefined,
      (searchParams.get("cuenta") ?? undefined) as CuentaMovimiento | undefined,
    );
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const created = await ds.createMovimiento(await req.json());
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
