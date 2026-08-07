// Firma visual del sitio (ver DESIGN.md — "Wave Dividers"): un borde curvo, no
// una línea recta, entre secciones de distinto color. El color de relleno
// siempre es el color con el que arranca la sección/franja que sigue, para
// que la transición se vea fluida, nunca cortada.

interface Props {
  fill: string;
  className?: string;
}

export function WaveDivider({ fill, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 1440 140"
      preserveAspectRatio="none"
      className={`absolute bottom-0 left-0 w-full h-[140px] pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <path
        d="M0,60 C120,100 240,20 360,60 C480,100 600,20 720,60 C840,100 960,20 1080,60 C1200,100 1320,20 1440,60 L1440,140 L0,140 Z"
        fill={fill}
      />
    </svg>
  );
}

interface RibbonProps {
  /** Color de lo que viene ANTES (ej. el fondo del AppBar). Se pinta como
   *  rect propio dentro del SVG — no depende de lo que haya detrás en el
   *  documento, así nunca se ve un corte recto entre el bloque anterior y
   *  la zona "transparente" de la onda. */
  topFill: string;
  /** Color de lo que viene DESPUÉS (el contenido/franja siguiente). */
  bottomFill: string;
  className?: string;
}

/**
 * Cinta angosta y fluida para separar el AppBar del contenido cuando no hay
 * una sección alta (tipo Hero) detrás — /cake, /desserts, /jelly, /custom.
 * Autocontenida: pinta ambos colores dentro del propio SVG (rect + path),
 * en vez de dejar una zona transparente que revele el fondo real del
 * documento (que puede no coincidir con el color de arriba y generar un
 * corte visible).
 */
export function HeaderWaveRibbon({ topFill, bottomFill, className = "" }: RibbonProps) {
  return (
    <svg
      viewBox="0 0 1440 140"
      preserveAspectRatio="none"
      className={`block w-full h-12 md:h-16 ${className}`}
      aria-hidden="true"
    >
      <rect x="0" y="0" width="1440" height="140" fill={topFill} />
      <path
        d="M0,60 C120,100 240,20 360,60 C480,100 600,20 720,60 C840,100 960,20 1080,60 C1200,100 1320,20 1440,60 L1440,140 L0,140 L0,60 Z"
        fill={bottomFill}
      />
    </svg>
  );
}
