export const runtime = "nodejs";

import clientPromise from "@/core/helpers/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { customer, cake } = await req.json();

    if (!customer?.name || !customer?.phone) {
      return NextResponse.json(
        { error: "Faltan datos del cliente" },
        { status: 400 },
      );
    }
    const client = await clientPromise;
    const db = client.db("hey_cookie");
    const collection = db.collection("orders");
    // Obtener IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    await collection.insertOne({
      customer,
      cake,
      ip,
      userAgent: req.headers.get("user-agent"),
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Order API Error:", err);
    return NextResponse.json(
      { error: "Error al guardar pedido" },
      { status: 500 },
    );
  }
}
