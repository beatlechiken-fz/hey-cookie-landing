import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./Hero.module.scss";

/**
 * Splash de la home: foto de producto sobre pared rosa con el texto a la
 * izquierda (la zona más clara de la foto).
 *
 * - Escritorio (xl+): `splash-home.webp` es la foto extendida hacia la
 *   izquierda con pared limpia; se recorta desde la izquierda (object-right),
 *   así el producto nunca se corta y el texto siempre cae sobre pared.
 * - Móvil/tablet: texto arriba sobre el mismo rosa y la foto original debajo.
 *
 * Solo se descarga una de las dos imágenes (<picture> con media query).
 */
export default function HeroSplash() {
  const t = useTranslations("hero");
  const fade = (delay: string) => `${styles["fade-up"]} ${styles[delay]}`;

  return (
    <div className="relative w-full overflow-hidden bg-[#efc3bd]">
      {/* Onda superior: el menú queda sobre la franja crema */}
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute top-0 left-0 z-20 w-full h-[140px] pointer-events-none"
      >
        <path
          d="M0,20 C120,60 240,-20 360,20 C480,60 600,-20 720,20 C840,60 960,-20 1080,20 C1200,60 1320,-20 1440,20 L1440,0 L0,0 Z"
          fill="#FAF3E0"
        />
      </svg>

      <div className="relative flex flex-col xl:block xl:h-[clamp(540px,46vw,100svh)]">
        {/* Halo claro detrás del texto: asegura lectura sin tapar la foto */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] hidden xl:block bg-[radial-gradient(ellipse_70%_60%_at_18%_38%,rgba(255,241,236,0.6),transparent_70%)]"
        />

        {/* TEXTO */}
        <div className="relative z-10 px-6 pt-32 md:px-12 xl:absolute xl:inset-y-0 xl:left-0 xl:max-w-[50vw] xl:pl-[6vw] xl:pr-0 xl:pt-[max(8.5vw,120px)]">
          <p
            className={`${fade("delay-1")} font-body text-xs xl:text-sm font-semibold uppercase tracking-[0.3em] text-[#6B3E26]`}
          >
            {t("kicker")}
          </p>

          <h1 className={`${fade("delay-2")} mt-4 flex flex-col text-[#3A1F14]`}>
            <span className="font-title-light leading-[1.05] text-[clamp(2.6rem,4.4vw,5.5rem)]">
              {t("title1")}
            </span>
            <span className="font-title leading-[1.35] text-frambuesa-texto text-[clamp(3rem,5vw,6.25rem)]">
              {t("title2")}
            </span>
          </h1>

          <p
            className={`${fade("delay-3")} mt-3 max-w-[34ch] font-body text-[clamp(1rem,1.15vw,1.25rem)] leading-relaxed text-[#3A1F14]/85`}
          >
            {t("subtitle")}
          </p>

          <div className={`${fade("delay-4")} mt-7 flex flex-wrap gap-3`}>
            <Link
              href="/custom"
              className="rounded-full bg-frambuesa px-6 py-3 font-body font-semibold text-white shadow-[0_8px_24px_-10px_rgba(122,36,64,0.6)] transition hover:bg-frambuesa-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A1F14]"
            >
              {t("ctaCustom")}
            </Link>
            <a
              href="#cookies"
              className="rounded-full border-2 border-[#3A1F14]/80 px-6 py-3 font-body font-semibold text-[#3A1F14] transition hover:bg-[#3A1F14] hover:text-[#FAF3E0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A1F14]"
            >
              {t("ctaCookies")}
            </a>
          </div>
        </div>

        {/* FOTO */}
        <picture className="relative mt-6 block xl:static xl:mt-0">
          <source media="(min-width: 1280px)" srcSet="/img/splash-home.webp" />
          <img
            src="/img/splash-home-mobile.webp"
            alt={t("imageAlt")}
            width={1672}
            height={940}
            fetchPriority="high"
            decoding="async"
            className="block w-full aspect-[4/3] sm:aspect-[16/9] object-cover object-[55%_50%] [mask-image:linear-gradient(to_bottom,transparent,black_20%)] xl:absolute xl:inset-0 xl:h-full xl:aspect-auto xl:object-right xl:[mask-image:none]"
          />
        </picture>
      </div>
    </div>
  );
}
