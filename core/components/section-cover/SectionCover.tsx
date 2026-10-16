import Image from "next/image";
import type { ReactNode } from "react";
import FloatingIngredients, {
  type Ingrediente,
} from "@/core/components/floating-ingredients/FloatingIngredients";

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
} as const;

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
  /** Hasta 2 ingredientes flotantes: uno junto al plato y otro sobre la onda. */
  ingredientes?: [Ingrediente, Ingrediente?];
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
  ingredientes,
}: Props) {
  const Heading = nivel;
  return (
    <header
      id={id}
      className="relative scroll-mt-20"
      style={{ backgroundColor: TONO_HEX[tono] }}
    >
      {ingredientes && (
        <FloatingIngredients
          items={[
            {
              nombre: ingredientes[0],
              pos: "right-[30%] top-8 lg:right-[24%]",
              size: "w-16 lg:w-24",
              rot: -12,
              depth: 0.7,
              soloDesktop: true,
            },
            ...(ingredientes[1]
              ? [
                  {
                    nombre: ingredientes[1],
                    pos: "left-[4%] -bottom-6 md:left-[44%] md:-bottom-8",
                    size: "w-12 md:w-16",
                    rot: 16,
                    depth: 0.35,
                  },
                ]
              : []),
          ]}
        />
      )}

      <div className="relative z-10 mx-auto flex max-w-6xl items-center gap-6 px-6 pb-20 pt-12 md:pb-24 md:pt-16">
        <div className="min-w-0 flex-1">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-cacao">
            {kicker}
          </p>
          <Heading className="mt-2 font-title-light text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.05] text-espresso">
            {titulo}
          </Heading>
          {descripcion && (
            <p className="mt-3 max-w-[46ch] font-body text-sm md:text-base leading-relaxed text-espresso/80">
              {descripcion}
            </p>
          )}
          {acciones && <div className="mt-5 flex flex-wrap gap-3">{acciones}</div>}
        </div>

        {imagen && (
          // El plato baja más allá de la banda y queda montado sobre la onda.
          <div className="relative w-28 shrink-0 translate-y-10 sm:w-40 md:w-56 md:translate-y-14">
            <div
              aria-hidden="true"
              className="absolute inset-x-[12%] -bottom-2 h-[12%] rounded-full bg-espresso/25 blur-lg"
            />
            <div className="relative aspect-square rounded-full bg-white p-[5%] shadow-[0_14px_30px_-12px_rgba(58,31,20,0.45)]">
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image src={imagen} alt="" fill sizes="(max-width: 768px) 160px, 224px" className="object-cover" />
              </div>
            </div>
          </div>
        )}
      </div>

      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-14 w-full md:h-20 pointer-events-none"
      >
        <path
          d="M0,60 C120,100 240,20 360,60 C480,100 600,20 720,60 C840,100 960,20 1080,60 C1200,100 1320,20 1440,60 L1440,140 L0,140 Z"
          fill={siguiente}
        />
      </svg>
    </header>
  );
}
