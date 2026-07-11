import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { connectDB } from "./db";
import { User } from "@/models/User";
import { verifyPassword } from "./password";
import { logAdminAction } from "./audit";
import type { UserRole } from "@/types/next-auth";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      id: "email-password",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.toLowerCase().trim();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        await connectDB();
        const user = await User.findOne({ email }).select(
          "+password name role isActive emailVerified failedLoginAttempts lockedUntil sessionVersion",
        );

        // Ambiguous on purpose: never reveal whether the email exists, whether it's the
        // password that's wrong, or whether the account is locked/inactive/unverified.
        const genericFailure = async (label: string) => {
          await logAdminAction(null, {
            action: "login_failed",
            entityType: "User",
            entityId: user?._id?.toString() ?? null,
            entityLabel: `${email} (${label})`,
          });
          return null;
        };

        if (!user || !user.password) return genericFailure("no such account");
        if (!user.isActive) return genericFailure("inactive");
        if (!user.emailVerified) return genericFailure("unverified");

        if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
          return genericFailure("locked");
        }

        const isValid = verifyPassword(password, user.password);
        if (!isValid) {
          const attempts = (user.failedLoginAttempts ?? 0) + 1;
          const update: Record<string, unknown> = { failedLoginAttempts: attempts };
          if (attempts >= MAX_FAILED_ATTEMPTS) {
            update.lockedUntil = new Date(Date.now() + LOCKOUT_MS);
          }
          await User.findByIdAndUpdate(user._id, update);
          return genericFailure("wrong password");
        }

        if (user.failedLoginAttempts || user.lockedUntil) {
          await User.findByIdAndUpdate(user._id, { failedLoginAttempts: 0, lockedUntil: null });
        }

        await logAdminAction(
          { id: user._id.toString(), name: user.name, role: user.role },
          {
            action: "login",
            entityType: "User",
            entityId: user._id.toString(),
            entityLabel: email,
          },
        );

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          sessionVersion: user.sessionVersion ?? 0,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      await connectDB();
      const email = user.email?.toLowerCase();
      if (!email) return false;

      let dbUser = await User.findOne({ email });
      if (!dbUser) {
        dbUser = await User.create({
          name: user.name || email,
          email,
          image: user.image,
          googleId: account.providerAccountId,
          emailVerified: new Date(),
        });
      } else if (!dbUser.googleId) {
        dbUser.googleId = account.providerAccountId;
        dbUser.emailVerified = dbUser.emailVerified || new Date();
        await dbUser.save();
      }

      if (!dbUser.isActive) return false;

      user.id = dbUser._id.toString();
      user.role = dbUser.role as UserRole;
      user.sessionVersion = dbUser.sessionVersion ?? 0;
      return true;
    },
  },
});
