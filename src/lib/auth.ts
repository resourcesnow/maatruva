import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { connectDB } from "./db";
import { User } from "@/models/User";
import { verifyOtpRecord } from "./otp";
import { verifyPassword } from "./password";

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
        const user = await User.findOne({ email }).select("+password");
        if (!user || !user.password) return null;
        if (!user.emailVerified) return null;

        const isValid = verifyPassword(password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    Credentials({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone as string | undefined;
        const otp = credentials?.otp as string | undefined;
        if (!phone || !otp) return null;

        const isValid = await verifyOtpRecord(phone, otp);
        if (!isValid) return null;

        await connectDB();
        let user = await User.findOne({ phone });
        if (!user) {
          user = await User.create({ name: phone, phone, phoneVerified: new Date() });
        } else if (!user.phoneVerified) {
          user.phoneVerified = new Date();
          await user.save();
        }

        return {
          id: user._id.toString(),
          name: user.name,
          role: user.role,
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

      user.id = dbUser._id.toString();
      user.role = dbUser.role as "admin" | "shop_manager" | "customer";
      return true;
    },
  },
});
