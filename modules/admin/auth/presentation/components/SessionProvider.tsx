"use client";
// src/components/admin/SessionProvider.tsx
// Wrapper de cliente necesario para usar SessionProvider de NextAuth en App Router

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function SessionProvider({ children }: { children: ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
