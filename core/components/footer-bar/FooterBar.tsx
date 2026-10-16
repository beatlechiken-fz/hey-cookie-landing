"use client";

import { useTranslations } from "next-intl";
import { HeaderWaveRibbon } from "@/core/components/wave-divider/WaveDivider";
import { Link } from "@/i18n/navigation";

const MENU_PDF = "/menus/menu-halloween-dia-de-muertos.pdf";

interface FooterBarProps {
  appearance?: "dark" | "light";
}

export default function FooterBar({ appearance = "dark" }: FooterBarProps) {
  const t = useTranslations("footer");
  const tm = useTranslations("mainnav");

  // Redes sociales
  const socialLinks = [
    {
      id: "whatsapp",
      href: "https://wa.me/5214433853472?text=Hola%20me%20gustaría%20cotizar%20galletas",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 32 32"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
        >
          <path
            fill={appearance === "dark" ? "white" : "#261102"}
            d="M16 3C8.82 3 3 8.82 3 16c0 2.29.61 4.44 1.66 6.3L3 29l6.9-1.61A12.9 12.9 0 0016 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.5c-1.92 0-3.72-.52-5.28-1.42l-.38-.22-4.09.95.98-3.99-.25-.4A10.42 10.42 0 015.5 16C5.5 10.2 10.2 5.5 16 5.5S26.5 10.2 26.5 16 21.8 26.5 16 26.5zm5.74-7.83c-.31-.16-1.85-.91-2.14-1.02-.29-.1-.5-.16-.71.16-.21.31-.81 1.02-.99 1.23-.18.21-.36.23-.67.08-.31-.16-1.32-.49-2.51-1.56-.93-.83-1.56-1.85-1.74-2.16-.18-.31-.02-.48.13-.64.13-.13.31-.34.47-.5.16-.16.21-.29.31-.49.1-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.63-.53-.55-.71-.56h-.6c-.21 0-.55.08-.84.39-.29.31-1.11 1.08-1.11 2.63 0 1.56 1.14 3.06 1.29 3.27.16.21 2.24 3.42 5.42 4.79.76.33 1.36.52 1.82.67.77.24 1.47.21 2.02.13.62-.09 1.85-.76 2.11-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.36z"
          />
        </svg>
      ),
    },
    {
      id: "instagram",
      href: "https://instagram.com/heycookie.mrl",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill={`${appearance === "dark" ? "white" : "#261102"}`}
        >
          <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zm-5 3.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm0 7.8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm4.8-8.6a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1z" />
        </svg>
      ),
    },
  ];

  if (appearance === "light") {
    // Variante compacta (menú móvil): solo redes y créditos.
    return (
      <footer className="w-full px-6 py-6">
        <div className="mx-auto flex w-[80%] flex-col gap-4">
          <div className="flex items-center justify-center gap-6">
            {socialLinks.map((s) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                aria-label={s.id}
                rel="noopener noreferrer"
                className="-m-2.5 p-2.5 transition hover:scale-110"
              >
                {s.icon}
              </a>
            ))}
          </div>
          <p className="text-center text-xs text-[#261102] opacity-80">{t("rights")}</p>
        </div>
      </footer>
    );
  }

  const columnas: { titulo: string; links: { label: string; href: string; externo?: boolean }[] }[] = [
    {
      titulo: t("explora"),
      links: [
        { label: t("galletas"), href: "/" },
        { label: tm("cake"), href: "/cake" },
        { label: tm("desserts"), href: "/desserts" },
        { label: tm("jelly"), href: "/jelly" },
        { label: t("temporada"), href: "/halloween" },
      ],
    },
    {
      titulo: t("pedidos"),
      links: [
        { label: t("custom"), href: "/custom" },
        { label: t("menuPdf"), href: MENU_PDF, externo: true },
        { label: t("cuenta"), href: "/user/login" },
      ],
    },
  ];

  const linkCls =
    "font-body text-sm text-crema/75 transition-colors hover:text-crema focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crema rounded";

  return (
    <>
      {/* Onda de firma del sitio: separa el contenido (crema) del footer oscuro. */}
      <HeaderWaveRibbon topFill="#FAF3E0" bottomFill="#261102" />

      <footer className="w-full bg-cafe-footer px-6 pb-8 pt-10 text-crema">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-title text-3xl text-crema">Hey Cookie</p>
            <p className="mt-1 font-body text-xs font-semibold uppercase tracking-[0.25em] text-crema/60">
              Bake Lab
            </p>
            <p className="mt-4 max-w-[30ch] font-body text-sm leading-relaxed text-crema/75">{t("tagline")}</p>
          </div>

          {columnas.map((col) => (
            <nav key={col.titulo} aria-label={col.titulo}>
              <h2 className="font-title-light text-lg text-crema">{col.titulo}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {l.externo ? (
                      <a href={l.href} download className={linkCls}>{l.label}</a>
                    ) : (
                      <Link href={l.href} className={linkCls}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="font-title-light text-lg text-crema">{t("contacto")}</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {socialLinks.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-3 ${linkCls}`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-crema/10 [&>svg]:h-5 [&>svg]:w-5">
                      {s.icon}
                    </span>
                    {s.id === "whatsapp" ? t("whatsapp") : t("instagram")}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-6xl border-t border-crema/10 pt-6 text-center font-body text-xs text-crema/60">
          {t("rights")}
        </p>
      </footer>
    </>
  );
}
