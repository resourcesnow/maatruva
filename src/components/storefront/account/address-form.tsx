"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addAddressAction, updateAddressAction } from "@/lib/actions/account";

const initialState = { ok: false, error: null as string | null };

type Address = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
};

export function AddressForm({ address, onSaved }: { address?: Address; onSaved?: () => void }) {
  const action = address ? updateAddressAction.bind(null, address.id) : addAddressAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success(address ? "Address updated." : "Address added.");
      if (!address) formRef.current?.reset();
      onSaved?.();
    } else if (state.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border-border grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          name="label"
          placeholder="e.g. Home, Work, Office"
          defaultValue={address?.label ?? "Home"}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          required
          placeholder="+91 98765 43210"
          defaultValue={address?.phone}
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="line1">Address Line 1</Label>
        <Input id="line1" name="line1" required defaultValue={address?.line1} />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="line2">Address Line 2 (optional)</Label>
        <Input id="line2" name="line2" defaultValue={address?.line2} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="city">City</Label>
        <Input id="city" name="city" required defaultValue={address?.city} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="state">State</Label>
        <Input id="state" name="state" required defaultValue={address?.state} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pincode">Pincode</Label>
        <Input id="pincode" name="pincode" required maxLength={6} defaultValue={address?.pincode} />
      </div>
      <label className="flex items-center gap-2 self-end text-sm">
        <input
          type="checkbox"
          name="isDefault"
          className="size-4"
          defaultChecked={address?.isDefault}
        />
        Set as default
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Saving..." : address ? "Save Changes" : "Add Address"}
        </Button>
        {address && (
          <Button type="button" variant="outline" onClick={onSaved}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
