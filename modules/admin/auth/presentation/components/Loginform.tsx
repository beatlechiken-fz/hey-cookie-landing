"use client";
// src/components/admin/LoginForm.tsx
// Login del panel: el splash de la home de fondo (con blur) y una tarjeta translúcida.

import { useState, useTransition } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { PasswordInput } from "@/core/components/PasswordInput";
import Images from "@/core/assets/Images";

const inputCls =
  "w-full rounded-xl border border-hc-line-strong bg-white/90 px-4 py-3 text-[14px] text-hc-ink placeholder:text-hc-soft/70 transition focus:border-hc-rose focus:bg-white focus:ring-4 focus:ring-hc-rose/15 disabled:opacity-60";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Después del login va al dashboard, no de regreso al login
  // Strip locale prefix (/es, /en) if present — i18n router adds it automatically
  const rawCallback = searchParams.get("callbackUrl") ?? "";
  const callbackUrl =
    rawCallback.replace(/^\/(es|en)(?=\/)/, "") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await signIn("admin-credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Correo o contraseña incorrectos.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Fondo: splash de la home desenfocado */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <picture>
        <source media="(min-width: 1024px)" srcSet="/img/splash-home.webp" />
        <img
          src="/img/splash-home-mobile.webp"
          alt=""
          className="h-full w-full scale-110 object-cover blur-[14px] saturate-[1.1]"
        />
        </picture>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/35 via-hc-rose-tint/25 to-hc-cacao/40" />

      <div className="relative w-full max-w-[420px] rounded-[28px] border border-white/60 bg-white/75 p-8 shadow-[0_30px_80px_-20px_rgba(58,31,20,0.45)] backdrop-blur-xl sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_8px_24px_-8px_rgba(192,96,122,0.45)] ring-1 ring-hc-rose-soft">
            <Image src={Images.logoShortOpacity} alt="Hey Cookie" width={52} height={52} priority />
          </span>
          <h1 className="text-[22px] font-bold tracking-tight text-hc-ink">Hola de nuevo</h1>
          <p className="mt-1 text-[14px] text-hc-muted">Panel de administración · Hey Cookie</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[12.5px] font-semibold text-hc-muted">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isPending}
              placeholder="admin@heycookie.mx"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[12.5px] font-semibold text-hc-muted">
              Contraseña
            </label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isPending}
              placeholder="••••••••"
              className={inputCls}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-hc-rose py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(192,96,122,0.9)] transition hover:bg-hc-rose-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-hc-rose/60 disabled:shadow-none"
          >
            {isPending && (
              <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.22-8.56" />
              </svg>
            )}
            {isPending ? "Verificando…" : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-8 text-center text-[11.5px] text-hc-soft">Acceso exclusivo para el equipo de Hey Cookie</p>
      </div>
    </div>
  );
}
