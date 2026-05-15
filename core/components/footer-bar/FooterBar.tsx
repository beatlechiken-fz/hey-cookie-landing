"use client";

import { useTranslations } from "next-intl";

interface FooterBarProps {
  appearance?: "dark" | "light";
}

export default function FooterBar({ appearance = "dark" }: FooterBarProps) {
  const t = useTranslations("footer");

  // Redes sociales
  const socialLinks = [
    {
      id: "wahtsapp",
      href: `href="https://wa.me/5214433853472?text=Hola%20me%20gustaría%20cotizar%20galletas"`,
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
      href: "#",
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
    {
      id: "tiktok",
      href: "#",
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill={`${appearance === "dark" ? "white" : "#261102"}`}
        >
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
    <footer
      className="w-full text-white px-6 py-6"
      style={{
        backgroundColor: appearance === "dark" ? "#261102" : "transparent",
      }}
    >
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
        <div
          className="text-xs text-center opacity-80"
          style={{ color: appearance === "dark" ? "white" : "#261102" }}
        >
          {t("rights")}
        </div>
      </div>
    </footer>
  );
}
