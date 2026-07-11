"use client";

import { useTransition } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { LogOut, Store, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/admin/confirm-action-dialog";
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
    <header className="border-border bg-background flex h-16 items-center justify-between border-b px-6">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <Badge variant="secondary" className="capitalize">
          {role.replace("_", " ")}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        {role === "super_admin" && (
          <ConfirmActionDialog
            triggerRender={<Button variant="ghost" size="sm" disabled={pending} />}
            triggerLabel={
              <>
                <ShieldAlert className="size-4" /> Log out all devices
              </>
            }
            title="Log out of all devices?"
            description="This immediately invalidates every active session for your account, including this one — you'll need to log in again."
            confirmLabel="Log out everywhere"
            onConfirm={handleLogoutAllDevices}
          />
        )}
        <Button variant="ghost" size="sm" render={<Link href="/" />}>
          <Store className="size-4" /> View Store
        </Button>
        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
          <LogOut className="size-4" /> Sign Out
        </Button>
      </div>
    </header>
  );
}
