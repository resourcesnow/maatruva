import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { ProfileForm } from "@/components/storefront/account/profile-form";

export const metadata: Metadata = { title: "My Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-xl font-semibold">Profile</h2>
      <ProfileForm
        name={session?.user?.name ?? ""}
        email={session?.user?.email ?? ""}
        role={session?.user?.role ?? "customer"}
      />
    </div>
  );
}
