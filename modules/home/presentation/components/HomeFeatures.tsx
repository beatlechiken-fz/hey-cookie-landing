import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Icons from "@/core/assets/Icons";

const WAVE =
  "M0,60 C120,100 240,20 360,60 C480,100 600,20 720,60 C840,100 960,20 1080,60 C1200,100 1320,20 1440,60 L1440,140 L0,140 Z";

const WHATSAPP_EVENTOS =
  "https://wa.me/5214433853472?text=Hola%20me%20gustaría%20cotizar%20un%20pedido%20para%20un%20evento";

/** Producto emplatado grande, con sombra de mesa. */
function Plato({ src, className = "" }: { src: string; className?: string }) {
  return (
    <div className={`relative aspect-square ${className}`}>
      <div aria-hidden="true" className="absolute inset-x-[12%] -bottom-3 h-[12%] rounded-full bg-espresso/25 blur-xl" />
      <div className="relative h-full w-full rounded-full bg-white p-[2%] shadow-[0_24px_50px_-20px_rgba(58,31,20,0.5)]">
        <div className="relative h-full w-full overflow-hidden rounded-full">
          <Image src={src} alt="" fill sizes="(max-width: 768px) 70vw, 420px" className="object-cover" />
        </div>
      </div>
    </div>
  );
}

/**
 * Bloque editorial "Arma tu pastel": banda rosa con ondas arriba y abajo; el
 * pastel emplatado se sale de la banda y se monta sobre la onda superior.
 */
export function ArmaTuPastelBlock() {
  const t = useTranslations("home.arma");

  return (
    <section aria-labelledby="arma-titulo" className="relative mt-24 bg-tinte-rosa md:mt-32">
      <svg viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden="true" className="absolute left-0 top-0 h-14 w-full rotate-180 md:h-20">
        <path d={WAVE} fill="#FAF3E0" />
      </svg>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-6 pb-24 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-14 md:pb-28">
        <Plato src="/img/cake-moka-md.webp" className="mx-auto -mt-16 w-[70%] max-w-[420px] md:-mt-24 md:w-full" />

        <div className="text-center md:text-left">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-cacao">{t("kicker")}</p>
          <h2 id="arma-titulo" className="mt-2 font-title-light text-[clamp(2.2rem,4.5vw,3.75rem)] leading-[1.05] text-espresso">
            {t("title")}
          </h2>
          <Image src={Icons.wavesPink} alt="" width={84} height={14} className="mx-auto mt-4 md:mx-0" />
          <p className="mx-auto mt-2 max-w-[44ch] font-body text-base leading-relaxed text-espresso/85 md:mx-0">
            {t("desc")}
          </p>
          <Link
            href="/custom"
            className="mt-7 inline-flex rounded-full bg-frambuesa px-7 py-3.5 font-body font-semibold text-white shadow-[0_8px_24px_-10px_rgba(122,36,64,0.6)] transition-colors hover:bg-frambuesa-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
          >
            {t("cta")}
          </Link>
        </div>
      </div>

      <svg viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden="true" className="absolute bottom-0 left-0 h-14 w-full md:h-20">
        <path d={WAVE} fill="#FAF3E0" />
      </svg>
    </section>
  );
}

/** Bloque "Eventos y regalos": texto a la izquierda, galletas emplatadas a la derecha. */
export function EventosBlock() {
  const t = useTranslations("home.eventos");
  const tc = useTranslations("contact");

  return (
    <section aria-labelledby="eventos-titulo" className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-[minmax(0,6fr)_minmax(0,4fr)] md:py-24">
      <div className="text-center md:text-left">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-cacao">{t("kicker")}</p>
        <h2 id="eventos-titulo" className="mt-2 font-title-light text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] text-espresso">
          {tc("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-[46ch] font-body text-base leading-relaxed text-espresso/85 md:mx-0">
          {tc("description")}
        </p>
        <a
          href={WHATSAPP_EVENTOS}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex rounded-full border-2 border-espresso/80 px-7 py-3 font-body font-semibold text-espresso transition-colors hover:bg-espresso hover:text-crema focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
        >
          {t("cta")}
        </a>
      </div>
      <Plato src="/img/ci-product-splash.webp" className="mx-auto w-[60%] max-w-[340px] md:w-full" />
    </section>
  );
}
