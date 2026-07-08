"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toggleUserActiveAction, updateUserRoleAction } from "@/lib/actions/admin/users";
import type { UserRole } from "@/types/next-auth";

export function UserRoleControls({
  userId,
  role,
  isActive,
  isSelf,
}: {
  userId: string;
  role: UserRole;
  isActive: boolean;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleRoleChange(value: string | null) {
    if (!value) return;
    startTransition(async () => {
      try {
        await updateUserRoleAction(userId, value as UserRole);
        toast.success("Role updated.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not update role.");
      }
    });
  }

  function handleActiveChange(checked: boolean) {
    startTransition(async () => {
      await toggleUserActiveAction(userId, checked);
      toast.success(checked ? "User activated." : "User deactivated.");
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={role} onValueChange={handleRoleChange} disabled={pending || isSelf}>
        <SelectTrigger className="w-36 capitalize">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="customer">Customer</SelectItem>
          <SelectItem value="shop_manager">Shop Manager</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      <Switch checked={isActive} onCheckedChange={handleActiveChange} disabled={pending} />
    </div>
  );
}
