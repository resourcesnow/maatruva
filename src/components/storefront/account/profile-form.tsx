"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateProfileAction } from "@/lib/actions/account";

const initialState = { ok: false, error: null as string | null };

export function ProfileForm({
  name,
  email,
  phone,
  role,
}: {
  name: string;
  email: string;
  phone: string;
  role: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  useEffect(() => {
    if (state.ok) toast.success("Profile updated.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={email} disabled />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+91XXXXXXXXXX"
          defaultValue={phone}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Role:</span>
        <Badge variant="secondary" className="capitalize">
          {role.replace("_", " ")}
        </Badge>
      </div>
      <Button type="submit" variant="brand" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
