// src/components/admin/appbar/adminMenuFactory.ts

export type AdminSubmenuItem = {
  id: string;
  label: string;
  url: string;
};

export type AdminMenuItem = {
  id: string;
  label: string;
  url: string;
  submenu?: AdminSubmenuItem[];
};

export type AdminMenuNavElement = {
  [key: string]: AdminMenuItem;
};

export function createAdminMenuNavElement(): AdminMenuNavElement {
  return {
    dashboard: {
      id: "dashboard",
      label: "Dashboard",
      url: "/admin/dashboard",
    },
    raws: {
      id: "raws",
      label: "Raws",
      url: "/admin/dashboard/raws/insumos",
      submenu: [
        {
          id: "insumos",
          label: "Insumos",
          url: "/admin/dashboard/raws/insumos",
        },
        {
          id: "coberturas",
          label: "Coberturas",
          url: "/admin/dashboard/raws/coberturas",
        },
        {
          id: "bizcochos",
          label: "Bizcochos",
          url: "/admin/dashboard/raws/bizcochos",
        },
        {
          id: "jarabes",
          label: "Jarabes",
          url: "/admin/dashboard/raws/jarabes",
        },
        {
          id: "empaques",
          label: "Empaques",
          url: "/admin/dashboard/raws/empaques",
        },
        {
          id: "gelatinas",
          label: "Gelatinas",
          url: "/admin/dashboard/raws/gelatinas",
        },
      ],
    },
    store: {
      id: "store",
      label: "Store",
      url: "/admin/dashboard/store/servicios",
      submenu: [
        {
          id: "servicios",
          label: "Servicios",
          url: "/admin/dashboard/store/servicios",
        },
        {
          id: "cupones",
          label: "Cupones",
          url: "/admin/dashboard/store/cupones",
        },
        {
          id: "clientes",
          label: "Clientes",
          url: "/admin/dashboard/store/clientes",
        },
        {
          id: "ordenes",
          label: "Órdenes",
          url: "/admin/dashboard/store/ordenes",
        },
        {
          id: "finanzas",
          label: "Finanzas",
          url: "/admin/dashboard/store/finanzas",
        },
      ],
    },
  };
}
