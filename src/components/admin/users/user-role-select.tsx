"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toggleUserActiveAction, updateUserRoleAction } from "@/lib/actions/admin/users";
import type { UserRole } from "@/types/next-auth";

const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Customer",
  shop_manager: "Shop Manager",
  admin: "Admin",
  super_admin: "Super Admin",
};

const DEFAULT_ROLES: UserRole[] = ["customer", "shop_manager", "admin"];

export function UserRoleControls({
  userId,
  userLabel,
  role,
  isActive,
  isSelf,
  availableRoles = DEFAULT_ROLES,
}: {
  userId: string;
  userLabel: string;
  role: UserRole;
  isActive: boolean;
  isSelf: boolean;
  availableRoles?: UserRole[];
}) {
  const [pending, startTransition] = useTransition();
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [pendingActive, setPendingActive] = useState<boolean | null>(null);

  function confirmRoleChange() {
    if (!pendingRole) return;
    const role = pendingRole;
    startTransition(async () => {
      try {
        await updateUserRoleAction(userId, role);
        toast.success(`${userLabel}'s role changed to ${ROLE_LABELS[role]}.`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not update role.");
      }
      setPendingRole(null);
    });
  }

  function confirmActiveChange() {
    if (pendingActive === null) return;
    const next = pendingActive;
    startTransition(async () => {
      await toggleUserActiveAction(userId, next);
      toast.success(next ? `${userLabel} reactivated.` : `${userLabel} deactivated.`);
      setPendingActive(null);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Select
        value={role}
        onValueChange={(value) => value && setPendingRole(value as UserRole)}
        disabled={pending || isSelf}
      >
        <SelectTrigger className="w-36 capitalize">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableRoles.map((r) => (
            <SelectItem key={r} value={r}>
              {ROLE_LABELS[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Switch
        checked={isActive}
        onCheckedChange={(checked) => setPendingActive(checked)}
        disabled={pending}
      />

      <AlertDialog
        open={pendingRole !== null}
        onOpenChange={(open) => !open && setPendingRole(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Change {userLabel}&apos;s role to {pendingRole ? ROLE_LABELS[pendingRole] : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This changes what {userLabel} can access immediately and signs out their existing
              sessions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button onClick={confirmRoleChange} disabled={pending}>
              {pending ? "Working..." : "Change role"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingActive !== null}
        onOpenChange={(open) => !open && setPendingActive(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingActive ? "Reactivate" : "Deactivate"} {userLabel}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingActive
                ? `${userLabel} will be able to log in again.`
                : `${userLabel} will be signed out immediately and unable to log in until reactivated.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button
              variant={pendingActive ? "default" : "destructive"}
              onClick={confirmActiveChange}
              disabled={pending}
            >
              {pending ? "Working..." : pendingActive ? "Reactivate" : "Deactivate"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
