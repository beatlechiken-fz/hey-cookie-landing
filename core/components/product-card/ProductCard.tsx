import Image from "next/image";

/**
 * Card de producto "boutique" (DESIGN.md → Product & category cards): fondo
 * pastel según línea/categoría, título serif arriba, producto emplatado en un
 * marco redondo al centro y precio + botón redondo abajo. Se usa en todo el
 * catálogo público (galletas, pasteles, repostería, gelatinas, temporada).
 */

export type TonoCard = "rosa" | "olivo" | "noche";

/**
 * Colores por tono. Sweet = rosa, Fitness/Healthy = olivo (verde), y la
 * temporada (Halloween & Día de muertos) = noche: morado oscuro con naranja.
 */
const TONO: Record<
  TonoCard,
  { bg: string; titulo: string; precio: string; detalle: string; boton: string; plato: string }
> = {
  rosa: {
    bg: "bg-tinte-rosa",
    titulo: "text-espresso",
    precio: "text-espresso",
    detalle: "text-cacao",
    boton: "bg-white text-espresso group-hover:bg-frambuesa group-hover:text-white",
    plato: "bg-white",
  },
  olivo: {
    bg: "bg-tinte-olivo",
    titulo: "text-espresso",
    precio: "text-espresso",
    detalle: "text-cacao",
    boton: "bg-white text-espresso group-hover:bg-frambuesa group-hover:text-white",
    plato: "bg-white",
  },
  noche: {
    bg: "bg-noche-morado",
    titulo: "text-crema",
    precio: "text-calabaza-texto",
    detalle: "text-crema/70",
    boton: "bg-calabaza text-noche group-hover:bg-calabaza-hover",
    plato: "bg-crema",
  },
};

/** Tono de un producto: temporada → noche; si no, por línea. */
export function tonoProducto(p: { linea?: string | null; coleccion?: string | null }): TonoCard {
  if (p.coleccion) return "noche";
  if (p.linea === "fitness" || p.linea === "healthy") return "olivo";
  return "rosa";
}

export const LINEA_ETIQUETA: Record<string, { label: string; cls: string }> = {
  sweet: { label: "Sweet", cls: "bg-frambuesa text-white" },
  fitness: { label: "Fitness", cls: "bg-[#4A7B35] text-white" },
  healthy: { label: "Healthy", cls: "bg-[#4A7B35] text-white" },
};

interface Props {
  nombre: string;
  imagenUrl: string | null;
  /** Imagen si el producto aún no tiene foto. */
  imagenFallback: string;
  tono: TonoCard;
  /** Texto del precio ya formateado ("$30"); null si no aplica. */
  precio?: string | null;
  /** Nota bajo el precio: "/ pz", medida, etc. */
  detalle?: string | null;
  /** Etiqueta de línea (solo donde se mezclan líneas). */
  etiqueta?: { label: string; cls: string } | null;
  /** Etiqueta de promoción ("Viernes 2×$40"). */
  promo?: string | null;
  onOpen: () => void;
  /** Precarga la imagen (primeras cards visibles). */
  priority?: boolean;
}

export default function ProductCard({
  nombre,
  imagenUrl,
  imagenFallback,
  tono,
  precio,
  detalle,
  etiqueta,
  promo,
  onOpen,
  priority,
}: Props) {
  return (
    <article
      className={`group relative flex h-full flex-col rounded-[20px] ${TONO[tono].bg} px-3 pb-3 pt-4 sm:px-5 sm:pb-4 sm:pt-5 transition-transform duration-300 ease-out hover:-translate-y-1 focus-within:-translate-y-1`}
    >
      {/* Fila de etiquetas: siempre ocupa su lugar (aunque esté vacía) para que
          todas las cards alineen título, plato y precio a la misma altura. */}
      <div className="-mx-1 -mt-1.5 flex h-5 items-start justify-between gap-1">
        {etiqueta ? (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold leading-4 ${etiqueta.cls}`}>
            {etiqueta.label}
          </span>
        ) : (
          <span />
        )}
        {promo && (
          <span className="truncate rounded-full bg-espresso px-2 py-0.5 text-[11px] font-bold leading-4 text-crema">
            {promo}
          </span>
        )}
      </div>

      {/* Título con alto fijo de 2 renglones, centrado: uno o dos renglones
          ocupan lo mismo. */}
      <h3
        className={`mt-1.5 flex h-[2.5em] items-center justify-center font-subtitle font-medium ${TONO[tono].titulo} text-center text-base sm:text-xl leading-tight`}
      >
        {/* Botón "estirado": toda la card es clicable sin meter un heading dentro de un botón. */}
        <button
          type="button"
          onClick={onOpen}
          className="line-clamp-2 after:absolute after:inset-0 after:rounded-[20px] after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-current cursor-pointer"
        >
          {nombre}
        </button>
      </h3>

      {/* Producto emplatado */}
      <div className="relative mx-auto mt-3 w-[80%] aspect-square">
        <div
          aria-hidden="true"
          className="absolute inset-x-[14%] -bottom-1 h-[12%] rounded-full bg-espresso/20 blur-md transition-all duration-300 group-hover:inset-x-[20%] group-hover:bg-espresso/15"
        />
        <div className={`relative h-full w-full rounded-full ${TONO[tono].plato} p-[5%] shadow-[0_6px_18px_-8px_rgba(58,31,20,0.35)] transition-transform duration-300 ease-out group-hover:-translate-y-1.5`}>
          <div className="relative h-full w-full overflow-hidden rounded-full">
            <Image
              src={imagenUrl ?? imagenFallback}
              alt=""
              fill
              priority={priority}
              sizes="(max-width: 640px) 40vw, (max-width: 1024px) 26vw, 20vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
        <div className="min-w-0 font-body leading-tight">
          {precio && <p className={`text-base sm:text-lg font-semibold ${TONO[tono].precio}`}>{precio}</p>}
          {detalle && <p className={`text-xs ${TONO[tono].detalle} truncate`}>{detalle}</p>}
        </div>
        <span
          aria-hidden="true"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-colors duration-300 ${TONO[tono].boton}`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </div>
    </article>
  );
}
