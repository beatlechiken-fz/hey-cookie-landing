import clientPromise from "@/core/helpers/mongodb";
import { NextResponse } from "next/server";

const LIMIT_MINUTES = 15;

export async function POST(req: Request) {
  try {
    const { ratings, comments } = await req.json();

    if (!ratings?.taste || !ratings?.texture || !ratings?.service) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Obtener IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const client = await clientPromise;
    const db = client.db("hey_cookie");
    const collection = db.collection("evaluations");

    // Calcular límite de tiempo
    const since = new Date(Date.now() - LIMIT_MINUTES * 60 * 1000);

    // Verificar si ya envió recientemente
    const recentSubmission = await collection.findOne({
      ip,
      createdAt: { $gte: since },
    });

    if (recentSubmission) {
      return NextResponse.json(
        {
          error: `Solo puedes enviar una evaluación cada ${LIMIT_MINUTES} minutos`,
        },
        { status: 429 }
      );
    }

    // Guardar evaluación
    await collection.insertOne({
      ratings,
      comments: comments || null,
      ip,
      createdAt: new Date(),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Error al guardar evaluación" },
      { status: 500 }
    );
  }
}
