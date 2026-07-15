"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteAddressAction, setDefaultAddressAction } from "@/lib/actions/account";
import { AddressForm } from "./address-form";

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

export function AddressList({ addresses }: { addresses: Address[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (addresses.length === 0) {
    return <p className="text-muted-foreground text-sm">No saved addresses yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {addresses.map((address) =>
        editingId === address.id ? (
          <li key={address.id}>
            <AddressForm address={address} onSaved={() => setEditingId(null)} />
          </li>
        ) : (
          <li
            key={address.id}
            className="border-border flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{address.label}</span>
                {address.isDefault && <Badge variant="secondary">Default</Badge>}
              </div>
              <p className="text-muted-foreground text-sm">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} -{" "}
                {address.pincode}
              </p>
              <p className="text-muted-foreground text-sm">{address.phone}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingId(address.id)}>
                Edit
              </Button>
              {!address.isDefault && (
                <form action={setDefaultAddressAction.bind(null, address.id)}>
                  <Button type="submit" variant="outline" size="sm">
                    Set Default
                  </Button>
                </form>
              )}
              <form action={deleteAddressAction.bind(null, address.id)}>
                <Button type="submit" variant="destructive" size="sm">
                  Delete
                </Button>
              </form>
            </div>
          </li>
        ),
      )}
    </ul>
  );
}
