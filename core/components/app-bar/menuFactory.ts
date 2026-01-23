import { useTranslations } from "next-intl";

// Creamos el tipo manualmente, equivalente a la función que retorna useTranslations()
export type TType = (key: string, values?: Record<string, any>) => string;

// Tipo para los elementos del submenú
export type SubmenuItem = {
  id: string;
  label: string;
  url: string;
};

// Tipo para los elementos principales del menú
export type MenuItem = {
  id: string;
  label: string;
  url: string;
  submenu?: SubmenuItem[]; // opcional
};

// Tipo del objeto completo del menú
export type MenuNavElement = {
  [key: string]: MenuItem;
};

// Tipo de las claves del menú (home, dev, support, etc.)
export type MenuNavEntry = keyof MenuNavElement;

// Función para crear el menú dinámicamente con traducciones
export function createMenuNavElement(t: TType): MenuNavElement {
  return {
    home: {
      id: "home",
      label: t("home"),
      url: "/",
    },
    cake: {
      id: "cake",
      label: t("cake"),
      url: "/cake",
    },
    desserts: {
      id: "desserts",
      label: t("desserts"),
      url: "/desserts",
    },
    other: {
      id: "other",
      label: t("other"),
      url: "/other",
    },
  };
}
