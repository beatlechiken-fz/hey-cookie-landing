"use client";

import { useTranslations } from "next-intl";
import { createMenuNavElement } from "./menuFactory";
import { useLanding } from "@/modules/home/presentation/store/useLanding";
import MainNavItem from "./MainNavItem";

export default function MainNav() {
  const t = useTranslations("mainnav");
  const menu = createMenuNavElement(t);

  const mainNavSelected = useLanding((s) => s.mainNavSelected);

  const mainNavItems = [
    { ...menu.home, active: mainNavSelected === "home" },
    {
      ...menu.dev,
      active:
        mainNavSelected === "dev" ||
        mainNavSelected === "apps" ||
        mainNavSelected === "landing" ||
        mainNavSelected === "ia",
    },
    {
      ...menu.support,
      active:
        mainNavSelected === "support" ||
        mainNavSelected === "fix" ||
        mainNavSelected === "maintainance",
    },
    {
      ...menu.store,
      active:
        mainNavSelected === "store" ||
        mainNavSelected === "parts" ||
        mainNavSelected === "update",
    },
    {
      ...menu.sit,
      active:
        mainNavSelected === "sit" ||
        mainNavSelected === "promotion" ||
        mainNavSelected === "about" ||
        mainNavSelected === "contact",
    },
  ];

  return (
    <main className="flex gap-4 items-center w-full bg-black">
      {mainNavItems.map((item) => (
        <MainNavItem key={item.id} {...item} />
      ))}
    </main>
  );
}
