// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";  // ← make sure you’ve moved your authOptions here

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };