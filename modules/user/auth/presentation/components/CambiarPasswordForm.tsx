"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { useLocale } from "next-intl";
import { PasswordInput } from "@/core/components/PasswordInput";

export function CambiarPasswordForm() {
  const locale = useLocale();
  const [password, setPassword]         = useState("");
  const [confirm, setConfirm]           = useState("");
  const [error, setError]               = useState<string | null>(null);
  const [isPending, startTransition]    = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/user/cambiar-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo actualizar la contraseña.");
        return;
      }

      // Cerrar sesión para que el nuevo JWT no traiga mustChangePassword
      await signOut({ redirect: false });
      window.location.href = `/${locale}/user/login?changed=1`;
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
        <div style={styles.iconWrap}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#f9e8ec" />
            <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="22">🔒</text>
          </svg>
        </div>

        <h1 style={styles.title}>Crea tu contraseña</h1>
        <p style={styles.subtitle}>
          Tu cuenta fue creada con una contraseña temporal.<br />
          Elige una nueva para continuar.
        </p>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.field}>
            <label style={styles.label}>Nueva contraseña</label>
            <PasswordInput
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isPending}
              placeholder="Mínimo 8 caracteres"
              className={inputCls}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirmar contraseña</label>
            <PasswordInput
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={isPending}
              placeholder="Repite tu nueva contraseña"
              className={inputCls}
            />
          </div>

          {error && (
            <p role="alert" style={styles.error}>{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{ ...styles.btn, ...(isPending ? styles.btnDisabled : {}) }}
          >
            {isPending ? "Guardando…" : "Guardar contraseña"}
          </button>
        </form>
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
    maxWidth: "420px",
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
  subtitle: {
    margin: "0 0 1.75rem",
    fontSize: "0.85rem",
    color: "#b07a8a",
    lineHeight: 1.6,
  },
  form: { display: "flex", flexDirection: "column" as const, gap: "1rem", textAlign: "left" as const },
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
    marginTop: "0.25rem",
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
