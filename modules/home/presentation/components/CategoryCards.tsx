import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * "Elige tu antojo": cards de categoría estilo boutique (fondo pastel, título
 * serif arriba, producto emplatado al centro, frase + flecha abajo).
 */

const CATEGORIAS = [
  { key: "galletas", href: "#galletas", img: "/img/cf-product-splash.webp", bg: "bg-tinte-rosa" },
  { key: "pasteles", href: "/cake", img: "/img/cake-redVelvet-sm.webp", bg: "bg-tinte-caramelo" },
  { key: "gelatinas", href: "/jelly", img: "/img/cake-jellyFruit-sm.webp", bg: "bg-tinte-lila" },
  { key: "custom", href: "/custom", img: "/img/cake-pinkVelvet-sm.webp", bg: "bg-tinte-olivo" },
] as const;

export default function CategoryCards() {
  const t = useTranslations("home.antojo");

  return (
    <section aria-labelledby="antojo-titulo" className="mx-auto max-w-6xl px-4 pb-6 pt-6 sm:px-6 md:pt-10">
      <p className="text-center font-body text-xs font-semibold uppercase tracking-[0.25em] text-cacao">
        {t("kicker")}
      </p>
      <h2 id="antojo-titulo" className="mt-2 text-center font-title-light text-[clamp(2rem,4vw,3rem)] leading-tight text-espresso">
        {t("title")}
      </h2>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {CATEGORIAS.map((c) => {
          const contenido = (
            <>
              <h3 className="font-subtitle text-lg sm:text-2xl font-medium leading-tight text-espresso">
                {t(`${c.key}.title`)}
              </h3>
              <div className="relative mx-auto mt-4 w-[72%] aspect-square">
                <div aria-hidden="true" className="absolute inset-x-[14%] -bottom-1 h-[12%] rounded-full bg-espresso/20 blur-md" />
                <div className="relative h-full w-full rounded-full bg-white p-[5%] shadow-[0_8px_20px_-10px_rgba(58,31,20,0.4)] transition-transform duration-300 ease-out group-hover:-translate-y-2">
                  <div className="relative h-full w-full overflow-hidden rounded-full">
                    <Image src={c.img} alt="" fill sizes="(max-width: 1024px) 34vw, 200px" className="object-cover" />
                  </div>
                </div>
              </div>
              <div className="mt-auto flex items-end justify-between gap-2 pt-5 text-left">
                <p className="font-body text-xs sm:text-sm leading-snug text-espresso/80">{t(`${c.key}.tag`)}</p>
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-espresso shadow-sm transition-colors duration-300 group-hover:bg-frambuesa group-hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </>
          );
          const cls = `group flex h-full flex-col rounded-[20px] ${c.bg} px-3 pb-3 pt-5 text-center transition-transform duration-300 ease-out hover:-translate-y-1 sm:px-5 sm:pb-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso`;
          return (
            <li key={c.key}>
              {c.href.startsWith("#") ? (
                <a href={c.href} className={cls}>{contenido}</a>
              ) : (
                <Link href={c.href} className={cls}>{contenido}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
