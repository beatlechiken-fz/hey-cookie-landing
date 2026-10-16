import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Portada corta de sección (rediseño 2026-10): banda pastel con título serif
 * y un producto emplatado que "se sale" de la banda y se monta sobre la onda.
 * Es corta a propósito (~280–340px): los productos empiezan justo debajo.
 *
 * `imagen` acepta la portada propia de la sección (core/data/portadas.ts) o,
 * mientras no exista, la foto de un producto de la sección.
 */

const TONO_HEX = {
  rosa: "#F6DDE4",
  olivo: "#E4E8D3",
  menta: "#DCEBDD",
  caramelo: "#F1DCC9",
  durazno: "#F9E1D2",
  lila: "#E9DFF0",
  calabaza: "#F8DCC4",
  // Temporada Halloween & Día de muertos (fondo oscuro, texto claro).
  noche: "#34203F",
} as const;

/** Colores de temporada (mismos valores que los tokens de globals.css). */
export const NOCHE = "#1E1517";
export const NOCHE_MORADO = "#34203F";

export type TonoPortada = keyof typeof TONO_HEX;

interface Props {
  id?: string;
  kicker: string;
  titulo: string;
  descripcion?: string | null;
  tono: TonoPortada;
  imagen?: string | null;
  /** Botones extra (p. ej. "Descargar menú"). */
  acciones?: ReactNode;
  /** Color de lo que sigue debajo (la onda se rellena con él). */
  siguiente?: string;
  /** Usa h1 en páginas propias (/cake, /jelly…); h2 dentro de la home. */
  nivel?: "h1" | "h2";
}

export default function SectionCover({
  id,
  kicker,
  titulo,
  descripcion,
  tono,
  imagen,
  acciones,
  siguiente = "#FAF3E0",
  nivel = "h2",
}: Props) {
  const Heading = nivel;
  const oscuro = tono === "noche";
  return (
    <header
      id={id}
      className="relative scroll-mt-20"
      style={{ backgroundColor: TONO_HEX[tono] }}
    >
      {/* Plato primero y luego el texto, centrados verticalmente dentro de
          la portada (pedido del cliente: el círculo no debe bajar al contenido). */}
      <div className="relative z-10 mx-auto flex max-w-6xl items-center gap-5 px-6 pb-20 pt-12 sm:gap-8 md:gap-12 md:pb-24 md:pt-16">
        {imagen && (
          <div className="relative w-32 shrink-0 sm:w-40 md:w-64">
            <div
              aria-hidden="true"
              className="absolute inset-x-[12%] -bottom-3 h-[12%] rounded-full bg-espresso/25 blur-lg"
            />
            <div className={`relative aspect-square rounded-full ${oscuro ? "bg-crema" : "bg-white"} p-[2.5%] shadow-[0_18px_36px_-14px_rgba(58,31,20,0.5)]`}>
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image src={imagen} alt="" fill sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 256px" className="object-cover" />
              </div>
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className={`font-body text-xs font-semibold uppercase tracking-[0.25em] ${oscuro ? "text-calabaza-texto" : "text-cacao"}`}>
            {kicker}
          </p>
          <Heading className={`mt-2 font-title-light text-[clamp(1.6rem,4.2vw,3.5rem)] leading-[1.05] ${oscuro ? "text-crema" : "text-espresso"}`}>
            {titulo}
          </Heading>
          {descripcion && (
            <p className={`mt-3 max-w-[46ch] font-body text-sm md:text-base leading-relaxed ${oscuro ? "text-crema/80" : "text-espresso/80"}`}>
              {descripcion}
            </p>
          )}
          {acciones && <div className="mt-5 flex flex-wrap gap-3">{acciones}</div>}
        </div>
      </div>

      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute -bottom-px left-0 h-14 w-full md:h-20 pointer-events-none"
      >
        <path
          d="M0,60 C120,100 240,20 360,60 C480,100 600,20 720,60 C840,100 960,20 1080,60 C1200,100 1320,20 1440,60 L1440,140 L0,140 Z"
          fill={siguiente}
        />
      </svg>
    </header>
  );
}

const ONDA =
  "M0,60 C120,100 240,20 360,60 C480,100 600,20 720,60 C840,100 960,20 1080,60 C1200,100 1320,20 1440,60 L1440,140 L0,140 Z";

interface BandaProps extends Omit<Props, "tono" | "siguiente"> {
  children: ReactNode;
  /** Color de lo que hay arriba; si se pasa, abre con una onda de ese color. */
  anterior?: string;
  /** Color de lo que sigue abajo (la onda final se rellena con él). */
  siguiente?: string;
}

/**
 * Sección de temporada (Halloween & Día de muertos): portada morado noche y
 * productos sobre negro cálido, con ondas de entrada y salida. Es el único
 * lugar donde el sitio rompe su paleta clara.
 */
export function BandaTemporada({ children, anterior, siguiente = "#FAF3E0", ...cover }: BandaProps) {
  return (
    <section aria-label={cover.titulo} className="relative bg-noche">
      {anterior && (
        <svg viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden="true" className="absolute left-0 -top-px z-20 h-12 w-full rotate-180 md:h-16 pointer-events-none">
          <path d={ONDA} fill={anterior} />
        </svg>
      )}
      <SectionCover {...cover} tono="noche" siguiente={NOCHE} />
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 md:pb-28 md:pt-20">{children}</div>
      <svg viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden="true" className="absolute -bottom-px left-0 h-14 w-full md:h-20 pointer-events-none">
        <path d={ONDA} fill={siguiente} />
      </svg>
    </section>
  );
}
