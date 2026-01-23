"use client";

import { useTranslations } from "next-intl";

export default function FooterBar() {
  const t = useTranslations("footer");

  // Redes sociales
  const socialLinks = [
    {
      id: "wahtsapp",
      href: `href="https://wa.me/5214433853472?text=Hola%20me%20gustaría%20cotizar%20galletas"`,
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path
            d="
    M12 2
    C6.5 2 2 6.3 2 11.7
    c0 1.9.6 3.6 1.6 5.1
    L2 22l5.3-1.4
    c1.4.8 3 .1 4.7.1
    C17.5 20.7 22 16.4 22 11
    S17.5 2 12 2
    Z

    M16.7 14.8
    c-.2.6-1.2 1.1-1.7 1.2
    -.4.1-.9.1-1.5-.1
    -.4-.1-1-.3-1.7-.7
    -2.9-1.3-3.9-3.7-4-3.9
    -.1-.2-.9-1.2-.9-2.3
    0-1.1.6-1.6.8-1.9
    .2-.2.4-.3.7-.3
    h.5c.2 0 .4 0 .6.4
    .2.4.8 1.9.9 2
    .1.2.1.4 0 .6
    -.1.2-.2.4-.3.5
    -.2.2-.4.4-.2.7
    .2.3.8 1.3 1.8 2.1
    1.2.9 2.1 1.2 2.4 1.3
    .3.1.5.1.7-.2
    .2-.2.9-1.1 1.1-1.4
    .2-.3.4-.3.6-.2
    .2.1 1.6.7 1.9.9
    .3.1.5.2.6.3
    .1.2.1.6 0 1.2
    Z
  "
          />
        </svg>
      ),
    },
    {
      id: "instagram",
      href: "#",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zm-5 3.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm0 7.8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm4.8-8.6a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1z" />
        </svg>
      ),
    },
    {
      id: "tiktok",
      href: "#",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path
            d="
    M14 2
    h2
    c.3 1.7 1.5 3.1 3.1 3.5
    v2
    c-1.3 0-2.5-.4-3.6-1.1
    v6.3
    c0 3-2.4 5.3-5.3 5.3
    S4.9 15.9 4.9 13
    c0-2.9 2.4-5.3 5.3-5.3
    .4 0 .8.1 1.1.1
    v2.9
    c-.3-.2-.7-.3-1.1-.3
    -1.3 0-2.3 1.1-2.3 2.5
    0 1.3 1 2.4 2.3 2.4
    1.3 0 2.4-1.1 2.4-2.4
    V2
    Z
  "
          />
        </svg>
      ),
    },
  ];

  return (
    <footer className="w-full bg-[#261102] text-white px-6 py-6">
      <div className="w-[80%] mx-auto flex flex-col gap-4">
        {/* ROW 2 — Redes sociales */}
        <div className="flex items-center gap-6 justify-center">
          {socialLinks.map((s) => (
            <a
              key={s.id}
              href={s.href}
              target="_blank"
              aria-label={s.id}
              rel="noopener noreferrer"
              className="hover:scale-110 transition"
            >
              {s.icon}
            </a>
          ))}
        </div>

        {/* ROW 3 — Texto final */}
        <div className="text-xs text-center opacity-80">{t("rights")}</div>
      </div>
    </footer>
  );
}
