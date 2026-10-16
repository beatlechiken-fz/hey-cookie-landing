"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Encuesta "Te escuchamos" (antes en la home). Vive en el panel del cliente y
 * solo se muestra cuando ya tiene al menos un pedido entregado: así quien la
 * contesta realmente probó el producto.
 */

type RatingKey = "taste" | "texture" | "visual" | "service";

const RATING_KEYS: RatingKey[] = ["taste", "texture", "visual", "service"];

// Escala malo→bueno (excepción confirmada en DESIGN.md, solo para este control).
const faces = [
  { value: 1, color: "#B23A3A", mouth: "M8 15c1.5-1.5 6.5-1.5 8 0" },
  { value: 2, color: "#C97A7A", mouth: "M8 14.5c1.5-.8 6.5-.8 8 0" },
  { value: 3, color: "#C68642", mouth: "M8 14h8" },
  { value: 4, color: "#7FB77E", mouth: "M8 14c1.5.8 6.5.8 8 0" },
  { value: 5, color: "#3FAE6A", mouth: "M8 13c1.5 1.5 6.5 1.5 8 0" },
];

function FaceIcon({ active, color, mouth }: { active: boolean; color: string; mouth: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`transition-all ${active ? "scale-110 opacity-100" : "opacity-45"}`}
    >
      <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1.6" />
      <circle cx="9" cy="10" r="1" stroke={color} strokeWidth="1.6" />
      <circle cx="15" cy="10" r="1" stroke={color} strokeWidth="1.6" />
      <path d={mouth} stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function TuOpinion() {
  const t = useTranslations("contact");
  const [ratings, setRatings] = useState<Record<RatingKey, number | null>>({
    taste: null,
    texture: null,
    visual: null,
    service: null,
  });
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const completo = Object.values(ratings).every(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!completo) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratings, comments }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No pudimos enviar tu evaluación. Intenta de nuevo.");
        return;
      }
      setEnviado(true);
    } catch {
      setError("No pudimos conectar. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-6 rounded-2xl border border-[#f0e0d0] bg-white p-5">
      <h2 className="font-title-light text-xl text-[#3A1F14]">{t("listen")}</h2>
      <p className="mt-0.5 text-sm text-[#6B3E26]/80">
        ¿Cómo estuvo tu último pedido? Tu opinión nos ayuda a mejorar.
      </p>

      {enviado ? (
        <p role="status" className="mt-4 rounded-xl bg-[#FFF7F0] px-4 py-3 text-sm font-semibold text-[#3A1F14]">
          {t("thanks")} {t("important")}
        </p>
      ) : (
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            {RATING_KEYS.map((key) => (
              <fieldset key={key}>
                <legend className="mb-1.5 text-sm font-semibold text-[#6B3E26]">
                  {t(`ratings.${key}`)}
                </legend>
                <div className="flex gap-3">
                  {faces.map((face) => (
                    <button
                      key={face.value}
                      type="button"
                      onClick={() => setRatings((prev) => ({ ...prev, [key]: face.value }))}
                      aria-label={`${t(`ratings.${key}`)}: ${face.value} de 5`}
                      aria-pressed={ratings[key] === face.value}
                      className="-m-1 p-1 transition hover:scale-110"
                    >
                      <FaceIcon active={ratings[key] === face.value} color={face.color} mouth={face.mouth} />
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          <textarea
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            aria-label="Comentarios"
            className="w-full rounded-xl border border-[#e8c4a0] bg-[#FFFDF8] p-3 text-sm text-[#3A1F14] focus:border-[#AA6A42] focus:outline-none"
            placeholder="Cuéntanos tu experiencia…"
          />

          {error && (
            <p role="alert" className="text-sm text-[#C0392B]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!completo || loading}
            className="rounded-xl bg-[#AA6A42] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#8a5535] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Enviando…" : "Enviar evaluación"}
          </button>
        </form>
      )}
    </section>
  );
}
