import type { Metadata } from "next";
import { AdminResetPasswordForm } from "@/components/admin/admin-reset-password-form";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Reset Password" };
export const dynamic = "force-dynamic";

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { email, token } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-semibold">{brand.name} Admin</h1>
          <p className="text-muted-foreground mt-1 text-sm">Set a new password.</p>
        </div>
        {email && token ? (
          <AdminResetPasswordForm email={email} token={token} />
        ) : (
          <p className="text-destructive text-center text-sm">
            Invalid or missing reset link. Request a new one from the login page.
          </p>
        )}
      </div>
    </div>
  );
}
