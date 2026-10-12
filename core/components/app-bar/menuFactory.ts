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
    bakeLab: {
      id: "bakeLab",
      label: t("bakeLab"),
      url: "",
      submenu: [
        { id: "home", label: t("home"), url: "/" },
        { id: "cake", label: t("cake"), url: "/cake" },
        { id: "desserts", label: t("desserts"), url: "/desserts" },
        { id: "jelly", label: t("jelly"), url: "/jelly" },
      ],
    },
    halloween: {
      id: "halloween",
      label: t("halloween"),
      url: "/halloween",
    },
    custom: {
      id: "custom",
      label: t("custom"),
      url: "/custom",
    },
  };
}
