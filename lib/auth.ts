// lib/auth.ts
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { env, requireNextAuthSecret } from "@/lib/env";
import { rateLimit } from "@/lib/security/rateLimit";

import { NextAuthOptions } from "next-auth";

const providers: NextAuthOptions["providers"] = [
  Credentials({
    name: "credentials",
    credentials: {
      phone: { label: "Phone", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.phone || !credentials?.password) return null;

      // Basic rate limit (per IP is ideal, but NextAuth authorize doesn't expose Request here reliably).
      const key = `auth:credentials:${String(credentials.phone).trim()}`;
      const rl = rateLimit({ key, limit: 10, windowMs: 10 * 60 * 1000 });
      if (!rl.ok) return null;

      await connectToDB();

      const user = await User.findOne({ phone: String(credentials.phone).trim() });
      if (!user || !user.password) return null;

      const isValid = await bcrypt.compare(
        credentials.password as string,
        user.password
      );
      if (!isValid) return null;

      return {
        id: user._id.toString(),
        name: user.fullName,
        email: user.email,
        image: user.photo,
      };
    },
  }),
];

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/sign-in",
  },
  cookies: {
    sessionToken: {
      name: env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectToDB();

        // Find existing user by googleId or email
        let dbUser = await User.findOne({
          $or: [
            { googleId: account.providerAccountId },
            { email: user.email },
          ],
        });

        if (dbUser) {
          // Link Google to existing account
          dbUser.googleId = account.providerAccountId;
          dbUser.authProvider = dbUser.password ? dbUser.authProvider : "google";
          if (user.name && !dbUser.fullName) dbUser.fullName = user.name;
          if (user.image && !dbUser.photo) dbUser.photo = user.image;
          await dbUser.save();
        } else {
          // Create new user via Google
          dbUser = await User.create({
            email: user.email,
            googleId: account.providerAccountId,
            authProvider: "google",
            fullName: user.name || "New User",
            photo: user.image || "",
            role: "guest",
          });
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        await connectToDB();
        let dbUser;

        if (account?.provider === "google") {
          dbUser = await User.findOne({
            $or: [
              { googleId: account.providerAccountId },
              { email: user.email },
            ],
          });
        } else {
          dbUser = await User.findById(user.id);
        }

        if (dbUser) {
          token.userId = dbUser._id.toString();
          token.role = dbUser.role;
          token.phone = dbUser.phone;
          token.profileComplete = !!(dbUser.phone && dbUser.password);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
        (session.user as any).profileComplete = token.profileComplete;
      }
      return session;
    },
  },
  secret: requireNextAuthSecret(),
};
