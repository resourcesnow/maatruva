"use client";

import { useTransition } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { LogOut, Store, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/admin/confirm-action-dialog";
import { MobileAdminNav } from "@/components/admin/mobile-nav";
import { logoutAllDevicesAction } from "@/lib/actions/admin/admins";
import type { UserRole } from "@/types/next-auth";

export function Topbar({ name, role }: { name: string; role: UserRole }) {
  const [pending, startTransition] = useTransition();

  function handleLogoutAllDevices() {
    startTransition(async () => {
      await logoutAllDevicesAction();
      toast.success("Logged out of all devices.");
      signOut({ callbackUrl: "/admin/login" });
    });
  }

  return (
    <header className="border-border bg-background flex h-16 items-center justify-between gap-2 border-b px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileAdminNav role={role} />
        <p className="truncate text-sm font-medium">{name}</p>
      </div>
      <div className="flex items-center gap-1 md:gap-2">
        {role === "super_admin" && (
          <ConfirmActionDialog
            triggerRender={<Button variant="ghost" size="sm" disabled={pending} />}
            triggerLabel={
              <>
                <ShieldAlert className="size-4" />
                <span className="hidden lg:inline">Log out all devices</span>
              </>
            }
            title="Log out of all devices?"
            description="This immediately invalidates every active session for your account, including this one — you'll need to log in again."
            confirmLabel="Log out everywhere"
            onConfirm={handleLogoutAllDevices}
          />
        )}
        <Button variant="ghost" size="sm" render={<Link href="/" />}>
          <Store className="size-4" />
          <span className="hidden sm:inline">View Store</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
