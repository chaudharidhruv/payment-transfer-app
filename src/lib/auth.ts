// // src/lib/auth.ts
// import type { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   callbacks: {
//     async redirect({ url, baseUrl }) {
//       if (url.startsWith("/")) return `${baseUrl}${url}`;
//       return baseUrl;
//     },
//   },
// };

// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },

    async signIn({ user }) {
      try {
        const email = user.email;
        if (!email) return false;

        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('balance')
          .eq('email', email)
          .single();

        if (fetchError || !profile) {
          console.error('Error fetching profile during signIn:', fetchError);
          return true;
        }

        const { error: insertError } = await supabase
          .from('balancechart')
          .insert({
            email,
            balance: profile.balance,
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Error inserting into balancechart on login:', insertError);
        }

        return true;
      } catch (err) {
        console.error('signIn callback error:', err);
        return false;
      }
    },
  },
};
