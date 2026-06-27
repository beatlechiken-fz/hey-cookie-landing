# Hey Cookie — Landing

App web para una repostería artesanal. Tiene tres zonas bien separadas: **pública** (website), **admin** (gestión interna) y **user** (tienda en línea para clientes).

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript 5 (strict) |
| Base de datos | Supabase (PostgreSQL) |
| Auth | NextAuth.js 4 — JWT strategy, 8h maxAge |
| i18n | next-intl 4 — locales: `es` (default), `en` |
| UI | TailwindCSS 4, Framer Motion 12, Swiper 12, Sass |
| Estado | Zustand 5 (carrito con `persist`) |
| Email | Resend 6 |
| Notificaciones | Telegram Bot API |
| Passwords | bcryptjs (salt 12) |
| Protección de rutas | `proxy.ts` en el Edge (Next.js middleware) |

---

## Arquitectura de capas (Clean Architecture)

Cada módulo sigue la misma estructura. El flujo siempre va en una sola dirección:

```
Component / Hook UI
  ↓
API Route (/api/...)
  ↓
UseCase (lógica de negocio)
  ↓
Repository Impl
  ↓
Datasource (Supabase)
```

```
modules/[nombre]/
├── domain/
│   ├── entities/        # Interfaces puras (modelos + DTOs)
│   ├── repositories/    # Interfaces abstractas de repositorios
│   └── usecases/        # Clases con método execute() — una clase por operación
├── data/
│   ├── datasources/     # Implementación directa a Supabase
│   └── repositories/    # Implementa la interfaz, inyecta el datasource
└── presentation/
    ├── components/      # Componentes React (PascalCase)
    ├── hooks/           # Custom hooks de UI (useFetch, paginación, etc.)
    └── store/           # Zustand stores (si aplica)
```

**Naming conventions:**
- Entities: `Nombre.entity.ts`
- Repository interface: `Nombre.repository.ts`
- Repository impl: `Nombre.repository.impl.ts`
- UseCase: `Nombre.usecase.ts`
- Datasource: `NombreSupabase.datasource.ts`
- Hooks: `use[CamelCase].ts`
- Components: `PascalCase.tsx`
- BD: `snake_case` para tablas y columnas

---

## Módulos

### Zona pública (`app/[locale]/`)
Rutas sin protección, accesibles a cualquiera.

| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `/` | `home` | Landing page, hero, galería de cookies, contacto |
| `/cake` | `cake` | Catálogo de pasteles |
| `/quote` | `quote` | Cotizador interactivo de pasteles personalizados |
| `/orders` | `orders` | Flujo de compra rápida (carrito Zustand) |
| `/desserts` | — | Postres |
| `/jelly` | — | Gelatinas |
| `/other` | — | Otros productos |

### Zona admin (`app/[locale]/admin/`)
Solo `role: "admin"`. Login en `/admin`.

**Raws (Materias primas):**
- `bizcochos` — cuerpo del pastel, M2M con `ingredientes`
- `coberturas` — frosting/ganache, M2M con ingredientes, sabores propios
- `jarabes` — rellenos, M2M con ingredientes, sabores propios
- `insumos` — ingredientes base (costo por unidad mínima)
- `empaques` — cajas/envolturas (con soporte de imágenes)
- `licores` — alcohol para rellenos

**Store (Tienda):**
- `productos` — catálogo (líneas: sweet/fitness/healthy), precios calculados por tamaño
- `ordenes` — pipeline de estados: `cotizacion → en_proceso → listo_entregar → pagado → entregado | cancelado`
- `clientes` — contactos + historial + cupones
- `cupones` — descuentos (% o monto fijo), asignables por cliente
- `finanzas` — movimientos, compras, resumen por período

### Zona user (`app/[locale]/user/`)
Solo `role: "user"`. Login en `/user/login`.

| Ruta | Descripción |
|------|-------------|
| `/user/login` | Login público (tabla `user_accounts`) |
| `/user/servicios` | Acceso a servicios del cliente (en desarrollo) |

---

## Autenticación

Un solo handler NextAuth en `/api/auth/[...nextauth]` con **dos providers**:

| Provider ID | Tabla | Role en JWT |
|-------------|-------|------------|
| `admin-credentials` | `admin_users` | `"admin"` |
| `user-credentials` | `user_accounts` | `"user"` |

**Helpers en `core/helpers/auth.ts`:**
- `getAdminSession()` — verifica sesión y `role === "admin"`, retorna `null` si no aplica
- `getUserSession()` — verifica sesión y `role === "user"`, retorna `null` si no aplica

**Esquema mínimo de ambas tablas:**
```sql
-- admin_users / user_accounts
id            uuid primary key default gen_random_uuid()
email         text unique not null
name          text not null
password_hash text not null   -- bcrypt salt 12
created_at    timestamptz default now()
```

---

## Protección de rutas — `proxy.ts`

Corre en el Edge. Reglas en orden:

| Path | Regla |
|------|-------|
| `/api/auth/*` | Siempre público (NextAuth) |
| `/admin` (exacto) | Público (login admin) |
| `/user/login` | Público (login usuario) |
| `/api/admin/*` | Requiere `token.role === "admin"` → 401 si no |
| `/api/user/*` | Requiere `token.role === "user"` → 401 si no |
| `/api/*` (otros) | Requiere cualquier token válido |
| `/admin/*` | Requiere `token.role === "admin"` → redirect a `/[locale]/admin` |
| `/user/*` | Requiere `token.role === "user"` → redirect a `/[locale]/user/login` |

El proxy preserva el locale en los redirects.

---

## Internacionalización (i18n)

- Locales: `["en", "es"]`, default `"es"`
- Archivos de mensajes: `messages/es.json`, `messages/en.json`
- Configuración: `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`

Todas las rutas van prefijadas con el locale: `/es/admin`, `/en/user/login`, etc.

**En server components:**
```ts
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
const locale = await getLocale();
redirect({ href: "/ruta", locale });
```

**En client components:**
```ts
import { useLocale } from "next-intl";
const locale = useLocale();
// usar `/${locale}/ruta` para construir URLs con prefijo correcto
```

---

## Supabase — Tablas principales

**Materias primas:**
`ingredientes`, `bizcochos`, `bizcocho_ingredientes`, `coberturas`, `cobertura_ingredientes`, `sabores_cobertura`, `jarabes`, `jarabe_ingredientes`, `sabores_jarabe`, `licores`, `empaques`

**Store:**
`productos`, `ordenes`, `orden_items`, `clientes`, `cupones`, `cupon_clientes`

**Finanzas:**
`finanzas_registros`, `finanzas_movimientos`, `finanzas_compras`

**Auth:**
`admin_users`, `user_accounts`

**Otros:**
`quotes` (cotizaciones)

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # Solo servidor — bypasea RLS
NEXTAUTH_SECRET=                # openssl rand -base64 32
NEXTAUTH_URL=                   # http://localhost:3000 en dev
RESEND_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
MONGODB_URI=                    # Conexión disponible (uso secundario)
```

**Clientes Supabase en `core/helpers/supabase.ts`:**
- `supabase` — anon key, para cliente (RLS activo)
- `getSupabaseAdmin()` — service role, solo servidor (bypasea RLS)

---

## Comandos

```bash
npm run dev      # Desarrollo (puerto 3000)
npm run build    # Build de producción
npm run lint     # ESLint
```

---

## Estructura de carpetas clave

```
landing/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx              # Home
│   │   ├── admin/                # Zona admin
│   │   │   ├── page.tsx          # Login admin
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/
│   │   │       ├── raws/         # Materias primas
│   │   │       └── store/        # Tienda admin
│   │   └── user/                 # Zona usuario
│   │       ├── layout.tsx
│   │       ├── login/page.tsx
│   │       └── servicios/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/   # Handler único NextAuth
│       ├── admin/                # APIs protegidas admin
│       └── user/                 # APIs protegidas user (futuro)
├── modules/                      # Lógica por zona/feature
│   ├── admin/
│   │   ├── auth/
│   │   ├── raws/                 # Materias primas
│   │   └── store/                # Productos, órdenes, clientes
│   ├── home/
│   ├── cake/
│   ├── quote/
│   ├── orders/
│   └── user/
│       └── auth/
├── core/
│   ├── helpers/                  # auth.ts, supabase.ts, funciones utilitarias
│   ├── types/                    # next-auth.d.ts, general.ts
│   ├── hooks/                    # Hooks globales
│   ├── data/                     # Datos estáticos del frontend
│   ├── assets/                   # Icons, Images, Videos
│   └── components/               # Componentes compartidos (AppBar, Footer, etc.)
├── i18n/                         # Configuración next-intl
├── messages/                     # Traducciones JSON
├── proxy.ts                      # Middleware Edge (protección de rutas)
└── CLAUDE.md
```
