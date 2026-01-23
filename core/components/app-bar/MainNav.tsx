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

  const items = Object.values(menu).map((item) => {
    const isHome = item.url === "/";

    const active = isHome
      ? normalizedPath === ""
      : normalizedPath === item.url ||
        normalizedPath.startsWith(item.url + "/");

    return {
      ...item,
      active,
    };
  });

  return (
    <nav className={`flex ${isMobile ? "flex-col gap-4" : "gap-4"}`}>
      {items.map((item) => (
        <MainNavItem
          key={item.id}
          {...item}
          isMobile={isMobile}
          isOpen={openSubmenuId === item.id}
          onToggle={() =>
            setOpenSubmenuId(openSubmenuId === item.id ? null : item.id)
          }
          onSelect={onSelect}
        />
      ))}
    </nav>
  );
}
