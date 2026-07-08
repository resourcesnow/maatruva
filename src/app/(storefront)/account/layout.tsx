import { AccountNav } from "@/components/storefront/account/account-nav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
      <h1 className="font-heading mb-8 text-3xl font-semibold">My Account</h1>
      <div className="flex flex-col gap-8 lg:flex-row">
        <AccountNav />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
