"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const fromCart = searchParams.get("from") === "cart";

  const [nombre, setNombre]               = useState("");
  const [email, setEmail]                 = useState("");
  const [telefono, setTelefono]           = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recibirOfertas, setRecibirOfertas]   = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [isPending, startTransition]      = useTransition();

  // Anti-bot: honeypot + timestamp
  const [_hp, set_hp] = useState("");
  const formOpenedAt  = useRef(Date.now());

  const callbackUrl = fromCart
    ? `/${locale}?cart=1`
    : `/${locale}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Honeypot: si el campo oculto tiene valor, es un bot
    if (_hp) return;

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    startTransition(async () => {
      // 1. Registrar
      const res = await fetch("/api/public/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre, email, telefono, password, recibirOfertas,
          _hp,
          _t: formOpenedAt.current,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo crear la cuenta.");
        return;
      }

      // 2. Iniciar sesión automáticamente
      const signInRes = await signIn("user-credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        // Cuenta creada pero no pudo iniciar sesión — llevar a login
        router.push(`/${locale}/user/login?registered=1&from=${fromCart ? "cart" : ""}`);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  }

  const inputCls = `
    w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#e8c4cd] bg-[#fffbfc]
    text-[#3d1a24] text-sm outline-none transition-colors font-body
    focus:border-[#c0607a] focus:ring-2 focus:ring-[#c0607a]/10
  `;

  return (
    <div style={styles.page}>
      <div style={styles.bg} aria-hidden />
      <div style={styles.card}>
        {/* Logo / Ícono */}
        <div style={styles.iconWrap}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#f9e8ec" />
            <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="24">🍪</text>
          </svg>
        </div>

        <h1 style={styles.title}>Crear cuenta</h1>
        <p style={styles.subtitle}>Únete a la familia Hey Cookie</p>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {/* Honeypot: invisible para humanos, visible para bots */}
          <input
            type="text"
            name="website"
            value={_hp}
            onChange={(e) => set_hp(e.target.value)}
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
            style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0, pointerEvents: "none" }}
          />

          {/* Nombre */}
          <div style={styles.field}>
            <label style={styles.label}>Nombre completo</label>
            <input
              type="text"
              autoComplete="name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={isPending}
              placeholder="Tu nombre"
              className={inputCls}
            />
          </div>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>Correo electrónico</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isPending}
              placeholder="tu@correo.com"
              className={inputCls}
            />
          </div>

          {/* Teléfono */}
          <div style={styles.field}>
            <label style={styles.label}>Número de teléfono</label>
            <input
              type="tel"
              autoComplete="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              disabled={isPending}
              placeholder="+52 55 1234 5678"
              className={inputCls}
            />
          </div>

          {/* Contraseña */}
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isPending}
              placeholder="Mínimo 8 caracteres"
              className={inputCls}
            />
          </div>

          {/* Confirmar contraseña */}
          <div style={styles.field}>
            <label style={styles.label}>Confirmar contraseña</label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isPending}
              placeholder="Repite tu contraseña"
              className={inputCls}
            />
          </div>

          {/* Checkbox ofertas */}
          <label className="flex items-start gap-3 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={recibirOfertas}
              onChange={(e) => setRecibirOfertas(e.target.checked)}
              disabled={isPending}
              className="mt-0.5 accent-[#c0607a] w-4 h-4 rounded cursor-pointer"
            />
            <span style={{ fontSize: "0.8rem", color: "#7b2d42", lineHeight: 1.4 }}>
              Quiero recibir ofertas, novedades y promociones exclusivas por correo.
            </span>
          </label>

          {error && (
            <p role="alert" style={styles.error}>{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{ ...styles.btn, ...(isPending ? styles.btnDisabled : {}) }}
          >
            {isPending ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        {/* Link a login */}
        <p style={{ fontSize: "0.82rem", color: "#b07a8a", marginTop: "1.25rem", textAlign: "center" }}>
          ¿Ya tienes cuenta?{" "}
          <a
            href={`/${locale}/user/login${fromCart ? "?from=cart" : ""}`}
            style={{ color: "#c0607a", fontWeight: 600, textDecoration: "none" }}
          >
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fdf6f0",
    fontFamily: "'Georgia', serif",
    padding: "2rem 1rem",
    position: "relative" as const,
    overflow: "hidden",
  },
  bg: {
    position: "absolute" as const,
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 15% 20%, #fce4ec55 0%, transparent 45%),
      radial-gradient(circle at 85% 80%, #f8bbd055 0%, transparent 45%)
    `,
    pointerEvents: "none" as const,
  },
  card: {
    position: "relative" as const,
    zIndex: 1,
    backgroundColor: "#ffffff",
    borderRadius: "1.5rem",
    padding: "2.5rem 2rem",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 8px 40px rgba(200,100,130,0.12), 0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #f5dce4",
    textAlign: "center" as const,
  },
  iconWrap: { display: "inline-flex", marginBottom: "1rem" },
  title: {
    margin: "0 0 0.25rem",
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#7b2d42",
    letterSpacing: "-0.02em",
  },
  subtitle: { margin: "0 0 1.5rem", fontSize: "0.875rem", color: "#b07a8a" },
  form: { display: "flex", flexDirection: "column" as const, gap: "0.875rem", textAlign: "left" as const },
  field: { display: "flex", flexDirection: "column" as const, gap: "0.3rem" },
  label: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#7b2d42",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  error: {
    fontSize: "0.85rem",
    color: "#c0392b",
    backgroundColor: "#fdecea",
    border: "1px solid #f5c6cb",
    borderRadius: "0.5rem",
    padding: "0.5rem 0.75rem",
    margin: 0,
  },
  btn: {
    marginTop: "0.5rem",
    padding: "0.85rem",
    borderRadius: "0.75rem",
    border: "none",
    backgroundColor: "#c0607a",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.02em",
    transition: "background-color 0.2s",
  },
  btnDisabled: { backgroundColor: "#e0a0b0", cursor: "not-allowed" },
} as const;
