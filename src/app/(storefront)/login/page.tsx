import type { Metadata } from "next";
import { LoginForm } from "@/components/storefront/auth/login-form";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl = "/account/profile" } = await searchParams;

  return (
    <div className="bg-porcelain mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-8 px-4 py-16 sm:px-8">
      <div className="text-center">
        <h1 className="font-heading text-maroon text-3xl font-semibold">Welcome to {brand.name}</h1>
        <p className="text-maroon/60 mt-2">Login or create an account to continue.</p>
      </div>
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
