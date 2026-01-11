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
    dev: {
      id: "dev",
      label: t("apps"),
      url: "/apps",
      submenu: [
        { id: "apps", label: t("dev"), url: "/apps" },
        { id: "landing", label: t("landing"), url: "/landing" },
        { id: "ia", label: t("ia"), url: "/" },
      ],
    },
    support: {
      id: "support",
      label: t("support"),
      url: "/",
      submenu: [
        { id: "fix", label: t("fix"), url: "/" },
        { id: "maintainance", label: t("maintainance"), url: "/" },
      ],
    },
    store: {
      id: "store",
      label: t("store"),
      url: "/",
      submenu: [
        { id: "parts", label: t("parts"), url: "/" },
        { id: "update", label: t("update"), url: "/" },
      ],
    },
    sit: {
      id: "sit",
      label: t("sit"),
      url: "/",
      submenu: [
        { id: "about", label: t("about"), url: "/" },
        { id: "promotion", label: t("promotion"), url: "/" },
        { id: "contact", label: t("contact"), url: "/" },
      ],
    },
  };
}
