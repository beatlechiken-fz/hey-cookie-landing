"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createMenuNavElement } from "./menuFactory";
import MainNavItem from "./MainNavItem";

function stripLocale(pathname: string) {
  return pathname.replace(/^\/(en|es)(?=\/|$)/, "");
}

export default function MainNav({ isMobile = false, onSelect }: any) {
  const t = useTranslations("mainnav");
  const pathname = usePathname();
  const normalizedPath = stripLocale(pathname);

  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);

  const menu = createMenuNavElement(t);

  const isActive = (url: string) =>
    url === "/"
      ? normalizedPath === ""
      : !!url && (normalizedPath === url || normalizedPath.startsWith(url + "/"));

  const items = Object.values(menu).map((item) => {
    const submenu = (item.submenu ?? []).map((s) => ({ ...s, active: isActive(s.url) }));
    return {
      ...item,
      submenu,
      // Un grupo (Bake Lab) está activo si alguna de sus secciones lo está.
      active: submenu.length > 0 ? submenu.some((s) => s.active) : isActive(item.url),
    };
  });

  return (
    <nav className={`flex ${isMobile ? "flex-col gap-4" : "items-center gap-2 xl:gap-4"}`}>
      {items.map((item) => (
        <MainNavItem
          key={item.id}
          {...item}
          isMobile={isMobile}
          isOpen={openSubmenuId === item.id}
          onToggle={() =>
            setOpenSubmenuId(openSubmenuId === item.id ? null : item.id)
          }
          onSelect={() => {
            setOpenSubmenuId(null);
            onSelect?.();
          }}
          onClose={() => setOpenSubmenuId(null)}
        />
      ))}
    </nav>
  );
}
