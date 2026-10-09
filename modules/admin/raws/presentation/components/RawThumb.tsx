"use client";

/**
 * Miniatura cuadrada para el inicio de cada fila de los listados de raws.
 * Si el elemento no tiene imagen muestra un placeholder del mismo tamaño para
 * que las filas queden alineadas.
 */
export function RawThumb({
  src,
  alt,
  size = "md",
}: {
  src: string | null | undefined;
  alt: string;
  /** md = filas de tabla (48px), sm = listas compactas/mobile (40px) */
  size?: "sm" | "md";
}) {
  const box = size === "md" ? "w-12 h-12" : "w-10 h-10";
  return (
    <div
      className={`${box} shrink-0 rounded-xl overflow-hidden bg-[#FFF7F0] border border-[#f0e0d0] flex items-center justify-center`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- URLs de Supabase Storage, mismo patrón que Empaques/Ornamentos
        <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" />
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 text-[#e8c4a0]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      )}
    </div>
  );
}
