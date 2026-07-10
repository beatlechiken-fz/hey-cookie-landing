// src/lib/auth.ts
import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },

  pages: {
    signIn: "/admin",
    error: "/admin",
  },

  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data: user, error } = await supabaseAdmin
          .from("admin_users")
          .select("id, email, name, password_hash")
          .eq("email", credentials.email.toLowerCase().trim())
          .single();

        if (error || !user) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.password_hash,
        );
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: "admin" } as any;
      },
    }),

    CredentialsProvider({
      id: "user-credentials",
      name: "Usuario",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data: user, error } = await supabaseAdmin
          .from("user_accounts")
          .select("id, email, name, password_hash, must_change_password")
          .eq("email", credentials.email.toLowerCase().trim())
          .single();

        if (error || !user) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.password_hash,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: "user",
          mustChangePassword: user.must_change_password ?? false,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.mustChangePassword = (user as any).mustChangePassword ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).mustChangePassword = token.mustChangePassword ?? false;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export const getAdminSession = async () => {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") return null;
  return session;
};

export const getUserSession = async () => {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "user") return null;
  return session;
};
