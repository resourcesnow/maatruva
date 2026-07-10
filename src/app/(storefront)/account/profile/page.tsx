import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCurrentUserProfile } from "@/lib/data/user";
import { getUserOrders } from "@/lib/data/orders";
import { getUserReviews } from "@/lib/data/reviews";
import { ProfileForm } from "@/components/storefront/account/profile-form";
import { ProfileHeader } from "@/components/storefront/account/profile-header";
import { AccountSummaryCards } from "@/components/storefront/account/account-summary-cards";

export const metadata: Metadata = { title: "My Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) notFound();

  const [profile, orders, reviews] = await Promise.all([
    getCurrentUserProfile(),
    getUserOrders(session.user.id),
    getUserReviews(session.user.id),
  ]);
  if (!profile) notFound();

  return (
    <div className="flex flex-col gap-8">
      <ProfileHeader name={profile.name} image={profile.image} isVerified={profile.isVerified} />

      <AccountSummaryCards
        orderCount={orders.length}
        reviewCount={reviews.length}
        latestOrder={orders[0] ?? null}
      />

      <div className="flex flex-col gap-6">
        <h2 className="font-heading text-xl font-semibold">Edit Profile</h2>
        <ProfileForm
          name={profile.name}
          email={profile.email ?? ""}
          role={profile.role ?? "customer"}
        />
      </div>
    </div>
  );
}
