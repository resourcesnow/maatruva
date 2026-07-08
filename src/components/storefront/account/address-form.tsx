"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addAddressAction } from "@/lib/actions/account";

const initialState = { ok: false, error: null as string | null };

export function AddressForm() {
  const [state, formAction, pending] = useActionState(addAddressAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Address added.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border-border grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="label">Label</Label>
        <Input id="label" name="label" placeholder="Home" defaultValue="Home" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" required placeholder="+91 98765 43210" />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="line1">Address Line 1</Label>
        <Input id="line1" name="line1" required />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="line2">Address Line 2 (optional)</Label>
        <Input id="line2" name="line2" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="city">City</Label>
        <Input id="city" name="city" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="state">State</Label>
        <Input id="state" name="state" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pincode">Pincode</Label>
        <Input id="pincode" name="pincode" required maxLength={6} />
      </div>
      <label className="flex items-center gap-2 self-end text-sm">
        <input type="checkbox" name="isDefault" className="size-4" />
        Set as default
      </label>
      <Button type="submit" disabled={pending} className="w-fit sm:col-span-2">
        {pending ? "Adding..." : "Add Address"}
      </Button>
    </form>
  );
}
