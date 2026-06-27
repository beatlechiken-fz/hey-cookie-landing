"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const callbackUrl =
    searchParams.get("callbackUrl") ?? `/${locale}/user/servicios`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await signIn("user-credentials", {
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
    <div style={styles.page}>
      <div style={styles.bg} aria-hidden />
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#f9e8ec" />
            <text
              x="50%"
              y="55%"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize="24"
            >
              🍪
            </text>
          </svg>
        </div>

        <h1 style={styles.title}>Mi cuenta</h1>
        <p style={styles.subtitle}>Accede a tus pedidos y servicios</p>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
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
              placeholder="tu@correo.com"
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) =>
                Object.assign(e.target.style, {
                  outline: "none",
                  borderColor: "#e8c4cd",
                })
              }
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isPending}
              placeholder="••••••••"
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) =>
                Object.assign(e.target.style, {
                  outline: "none",
                  borderColor: "#e8c4cd",
                })
              }
            />
          </div>

          {error && (
            <p role="alert" style={styles.error}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{ ...styles.btn, ...(isPending ? styles.btnDisabled : {}) }}
          >
            {isPending ? "Verificando…" : "Iniciar sesión"}
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
    padding: "1rem",
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
    maxWidth: "400px",
    boxShadow:
      "0 8px 40px rgba(200, 100, 130, 0.12), 0 2px 8px rgba(0,0,0,0.06)",
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
  subtitle: { margin: "0 0 1.75rem", fontSize: "0.875rem", color: "#b07a8a" },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    textAlign: "left" as const,
  },
  field: { display: "flex", flexDirection: "column" as const, gap: "0.375rem" },
  label: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#7b2d42",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  input: {
    padding: "0.7rem 0.9rem",
    borderRadius: "0.75rem",
    border: "1.5px solid #e8c4cd",
    fontSize: "0.95rem",
    color: "#3d1a24",
    backgroundColor: "#fffbfc",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  inputFocus: { borderColor: "#c0607a", outline: "none" },
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
    padding: "0.8rem",
    borderRadius: "0.75rem",
    border: "none",
    backgroundColor: "#c0607a",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.02em",
    transition: "background-color 0.2s, transform 0.1s",
  },
  btnDisabled: { backgroundColor: "#e0a0b0", cursor: "not-allowed" },
} as const;
