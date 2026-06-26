// src/app/api/auth/[...nextauth]/route.ts
// Route handler de NextAuth para App Router

import NextAuth from "next-auth";
import { authOptions } from "@/core/helpers/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
