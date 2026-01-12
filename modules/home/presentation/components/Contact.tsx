"use client";

import { useBreakpoint } from "@/core/hooks/useBreakpoint";
import { CustomBreakpoint } from "@/core/types/general";
import Image from "next/image";
import { useState } from "react";

type RatingKey = "taste" | "texture" | "service";

const ratingItems = [
  { key: "taste", label: "Sabor" },
  { key: "texture", label: "Consistencia y textura" },
  { key: "service", label: "Atención" },
];

const faces = [
  { value: 1, color: "#B23A3A", mouth: "M8 15c1.5-1.5 6.5-1.5 8 0" }, // triste
  { value: 2, color: "#C97A7A", mouth: "M8 14.5c1.5-.8 6.5-.8 8 0" }, // poco triste
  { value: 3, color: "#C68642", mouth: "M8 14h8" }, // neutral
  { value: 4, color: "#7FB77E", mouth: "M8 14c1.5.8 6.5.8 8 0" }, // leve sonrisa
  { value: 5, color: "#3FAE6A", mouth: "M8 13c1.5 1.5 6.5 1.5 8 0" }, // feliz
];

function FaceIcon({
  active,
  color,
  mouth,
}: {
  active: boolean;
  color: string;
  mouth: string;
}) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      className={`transition-all ${
        active ? "scale-110 opacity-100" : "opacity-50"
      }`}
    >
      {/* Contorno */}
      <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1.6" />

      {/* Ojos (stroke, NO fill) */}
      <circle cx="9" cy="10" r="1" stroke={color} strokeWidth="1.6" />
      <circle cx="15" cy="10" r="1" stroke={color} strokeWidth="1.6" />

      {/* Boca */}
      <path d={mouth} stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Contact() {
  const breakpointsConfig: Record<
    CustomBreakpoint,
    { min?: number; max?: number }
  > = {
    cxs: { max: 839 },
    csm: { min: 840, max: 1022 },
    cmd: { min: 1023, max: 1199 },
    clg: { min: 1200 },
  };

  const breakpoint = useBreakpoint(breakpointsConfig);
  const [sended, setSended] = useState(false);

  const [ratings, setRatings] = useState<Record<RatingKey, number | null>>({
    taste: null,
    texture: null,
    service: null,
  });

  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid = Object.values(ratings).every(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratings, comments }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setSended(false);
      return;
    }

    setComments("");
    setRatings({ taste: null, texture: null, service: null });
    setSended(true);
  }

  return (
    <section className="relative bg-[#FAF3E0] overflow-hidden pb-20 w-full">
      {/* Mancha izquierda */}
      <svg
        className="absolute bottom-0 left-0 w-[920px] h-[920px] -translate-x-1/3 translate-y-1/3 z-0"
        viewBox="0 0 400 400"
      >
        <circle cx="200" cy="200" r="200" fill="#E6D3B1" />
      </svg>

      {/* Mancha derecha */}
      <svg
        className="absolute bottom-0 right-0 w-[420px] h-[420px] translate-x-1/3 translate-y-1/3 z-0"
        viewBox="0 0 400 400"
      >
        <circle cx="200" cy="200" r="200" fill="#E6D3B1" />
      </svg>

      <div
        className="relative z-10 mx-auto px-6 flex"
        style={{
          width: breakpoint === "clg" ? "70%" : "85%",
          flexDirection:
            breakpoint === "clg" || breakpoint === "cmd"
              ? "row"
              : "column-reverse",
          gap: breakpoint === "clg" || breakpoint === "cmd" ? "144px" : "84px",
        }}
      >
        {/* FORMULARIO */}
        <div className="flex justify-center w-full">
          <div className="bg-white/80 backdrop-blur rounded-3xl p-10 shadow-lg w-[440px]">
            <h3 className="text-3xl font-extrabold text-[#6B3E26] mb-8 text-center">
              Te escuchamos
            </h3>

            {!sended ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {ratingItems.map((item) => (
                  <div key={item.key}>
                    <p className="mb-2 font-semibold text-[#6B3E26]">
                      {item.label}
                    </p>
                    <div className="flex gap-4">
                      {faces.map((face) => (
                        <button
                          key={face.value}
                          type="button"
                          onClick={() =>
                            setRatings((prev) => ({
                              ...prev,
                              [item.key]: face.value,
                            }))
                          }
                          className="hover:scale-110 transition"
                        >
                          <FaceIcon
                            active={
                              ratings[item.key as RatingKey] === face.value
                            }
                            color={face.color}
                            mouth={face.mouth}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full rounded-xl border border-[#6B3E26]/30 p-4 focus:ring-2 focus:ring-[#C68642]"
                  placeholder="Cuéntanos tu experiencia…"
                />

                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className={`w-full py-4 rounded-lg font-semibold transition cursor-pointer ${
                    isFormValid
                      ? "bg-[#6B3E26] text-white hover:bg-[#C68642]"
                      : "bg-[#6B3E26]/40 text-white cursor-not-allowed"
                  }`}
                >
                  {loading ? "Enviando..." : "Enviar evaluación"}
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-4 text-[#C68642] text-[clamp(2rem,4vh,5rem)] items-center min-h-[400px]">
                <svg
                  width="88"
                  height="88"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mt-12"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9.5"
                    stroke="#47A2A5"
                    stroke-width="1.6"
                  />

                  <path
                    d="M7.5 12.5L10.5 15.5L16.5 9.5"
                    stroke="#47A2A5"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span className="font-bold">Gracias!</span>
                <span className="text-center">
                  Tu opinión es muy importante
                </span>
              </div>
            )}
          </div>
        </div>

        {/* TEXTO DERECHO */}
        <div
          className="flex flex-col w-full pt-4"
          style={{
            alignItems:
              breakpoint === "clg" || breakpoint === "cmd"
                ? "flex-start"
                : "center",
            textAlign:
              breakpoint === "clg" || breakpoint === "cmd" ? "left" : "center",
          }}
        >
          <h3 className="text-[clamp(3.5rem,4.5vw,5rem)] font-extrabold bg-gradient-to-r from-[#8A3414] via-[#C68642] to-[#D7B07A] bg-clip-text text-transparent leading-tight">
            Galletas para tus eventos
          </h3>

          <p className="mt-6 text-[clamp(1.2rem,1.7vw,1.9rem)] text-[#6B3E26]/80 leading-tight">
            Cotizamos pedidos especiales para eventos, regalos corporativos y
            celebraciones. Escríbenos y creemos algo delicioso juntos.
          </p>

          <p className="mt-6 text-2xl font-semibold text-[#6B3E26]">
            📞 <span className="ml-2 text-[#47a2a5ff]">443 123 67 33</span>
          </p>
        </div>
      </div>
    </section>
  );
}
