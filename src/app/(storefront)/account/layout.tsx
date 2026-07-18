import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { AccountNav } from "@/components/storefront/account/account-nav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/account/profile");
  }

  // Live re-check against the DB on every account navigation, mirroring the admin panel's
  // enforcement pattern (src/app/(admin)/admin/(protected)/layout.tsx) — the middleware only
  // trusts the JWT's sessionVersion claim, which stays valid for the token's lifetime even
  // after a password reset bumps the DB value. This is the actual enforcement point.
  await connectDB();
  const freshUser = await User.findById(session.user.id).select("isActive sessionVersion");
  if (
    !freshUser ||
    !freshUser.isActive ||
    freshUser.sessionVersion !== session.user.sessionVersion
  ) {
    redirect("/login?callbackUrl=/account/profile");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
      <h1 className="font-heading text-maroon mb-8 text-3xl font-semibold">My Account</h1>
      <div className="flex flex-col gap-8 lg:flex-row">
        <AccountNav />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
