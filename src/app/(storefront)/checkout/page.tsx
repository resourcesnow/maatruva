import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getCurrentUserAddresses } from "@/lib/data/user";
import { CheckoutForm } from "@/components/storefront/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();
  const addresses = session?.user ? await getCurrentUserAddresses() : [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8">
      <h1 className="font-heading mb-8 text-3xl font-semibold">Checkout</h1>
      <CheckoutForm
        addresses={addresses}
        isLoggedIn={!!session?.user}
        userName={session?.user?.name ?? undefined}
        userEmail={session?.user?.email ?? undefined}
      />
    </div>
  );
}
