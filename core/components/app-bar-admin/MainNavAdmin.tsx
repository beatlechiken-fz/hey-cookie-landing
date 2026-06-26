"use client";
// src/components/admin/appbar/AdminNav.tsx
// Espejo de MainNav — renderiza los ítems del menú admin.

import { usePathname } from "next/navigation";
import { useState } from "react";
import { createAdminMenuNavElement } from "./menuFactoryAdmin";
import AdminNavItem from "./MainNavItemAdmin";

function stripLocale(pathname: string) {
  return pathname.replace(/^\/(en|es)(?=\/|$)/, "");
}

interface Props {
  isMobile?: boolean;
  onSelect?: () => void;
}

export default function AdminNav({ isMobile = false, onSelect }: Props) {
  const pathname = usePathname();
  const normalizedPath = stripLocale(pathname);
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);

  const menu = createAdminMenuNavElement();

  const items = Object.values(menu).map((item) => {
    const isDashboardRoot = item.url === "/admin/dashboard";

    const active = isDashboardRoot
      ? normalizedPath === "/admin/dashboard"
      : normalizedPath === item.url ||
        normalizedPath.startsWith(item.url + "/");

    return { ...item, active };
  });

  return (
    <nav
      className={`flex ${isMobile ? "flex-col gap-2" : "items-center gap-1"}`}
    >
      {items.map((item) => (
        <AdminNavItem
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
