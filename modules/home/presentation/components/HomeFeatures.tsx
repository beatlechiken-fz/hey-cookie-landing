import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SectionCover from "@/core/components/section-cover/SectionCover";

const WAVE =
  "M0,60 C120,100 240,20 360,60 C480,100 600,20 720,60 C840,100 960,20 1080,60 C1200,100 1320,20 1440,60 L1440,140 L0,140 Z";

const WHATSAPP_EVENTOS =
  "https://wa.me/5214433853472?text=Hola%20me%20gustaría%20cotizar%20un%20pedido%20para%20un%20evento";

/**
 * Bloque "Arma tu pastel": misma portada que el resto de las secciones
 * (círculo del mismo tamaño a la izquierda, texto a la derecha), en rosa y
 * con una onda de entrada desde el crema.
 */
export function ArmaTuPastelBlock() {
  const t = useTranslations("home.arma");

  return (
    <section aria-label={t("title")} className="relative mt-12 md:mt-16">
      <svg viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden="true" className="absolute left-0 -top-px z-20 h-12 w-full rotate-180 md:h-16 pointer-events-none">
        <path d={WAVE} fill="#FAF3E0" />
      </svg>
      <SectionCover
        kicker={t("kicker")}
        titulo={t("title")}
        descripcion={t("desc")}
        tono="rosa"
        imagen="/img/cake-moka-md.webp"
        acciones={
          <Link
            href="/custom"
            className="inline-flex rounded-full bg-frambuesa px-6 py-3 font-body font-semibold text-white shadow-[0_8px_24px_-10px_rgba(122,36,64,0.6)] transition-colors hover:bg-frambuesa-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
          >
            {t("cta")}
          </Link>
        }
      />
    </section>
  );
}

/**
 * Bloque "Eventos y regalos": misma composición y tamaño de círculo que las
 * portadas, sobre el fondo crema.
 */
export function EventosBlock() {
  const t = useTranslations("home.eventos");
  const tc = useTranslations("contact");

  return (
    <section aria-label={tc("title")} className="pb-6">
      <SectionCover
        kicker={t("kicker")}
        titulo={tc("title")}
        descripcion={tc("description")}
        tono="crema"
        imagen="/img/ci-product-splash.webp"
        acciones={
          <a
            href={WHATSAPP_EVENTOS}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full border-2 border-espresso/80 px-6 py-2.5 font-body font-semibold text-espresso transition-colors hover:bg-espresso hover:text-crema focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
          >
            {t("cta")}
          </a>
        }
      />
    </section>
  );
}
