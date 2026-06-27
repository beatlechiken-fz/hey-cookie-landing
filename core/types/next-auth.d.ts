// src/types/next-auth.d.ts
// Extiende los tipos de NextAuth para incluir "id" y "role" en Session y JWT.

import type { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "admin" | "user";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: "admin" | "user";
  }
}
