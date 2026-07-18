import type { Metadata } from "next";
import { getCurrentUserAddresses } from "@/lib/data/user";
import { AddressForm } from "@/components/storefront/account/address-form";
import { AddressList } from "@/components/storefront/account/address-list";

export const metadata: Metadata = { title: "My Addresses" };
export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const addresses = await getCurrentUserAddresses();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-maroon text-xl font-semibold">Addresses</h2>
      <AddressList addresses={addresses} />
      <AddressForm />
    </div>
  );
}
