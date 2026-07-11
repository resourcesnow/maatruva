import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Admin Login" };
export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["super_admin", "admin", "shop_manager"];

function safeCallbackUrl(raw: string | undefined) {
  if (raw && raw.startsWith("/admin") && !raw.startsWith("//")) return raw;
  return "/admin";
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user && ADMIN_ROLES.includes(session.user.role)) {
    redirect("/admin");
  }

  const { callbackUrl } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-semibold">{brand.name} Admin</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sign in to manage the store.</p>
        </div>
        <AdminLoginForm callbackUrl={safeCallbackUrl(callbackUrl)} />
      </div>
    </div>
  );
}
