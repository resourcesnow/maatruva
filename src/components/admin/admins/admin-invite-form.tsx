"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAdminAction } from "@/lib/actions/admin/admins";

const initialState = { ok: false, error: null as string | null };

export function AdminInviteForm() {
  const [state, formAction, pending] = useActionState(createAdminAction, initialState);
  const router = useRouter();
  const [role, setRole] = useState("admin");

  useEffect(() => {
    if (state.ok) {
      toast.success("Invite sent.");
      router.push("/admin/admins");
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role">Role</Label>
        <Select value={role} onValueChange={(v) => v && setRole(v)}>
          <SelectTrigger id="role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shop_manager">Shop Manager</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="role" value={role} />
      </div>
      <p className="text-muted-foreground text-xs">
        They&apos;ll receive an email with a link to set their own password. No password is set or
        shared by you.
      </p>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Sending invite..." : "Send invite"}
      </Button>
    </form>
  );
}
