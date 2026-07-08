"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState = { ok: false, error: null as string | null };

function toDateInput(value?: string) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function CouponForm({
  initialValues,
  action,
}: {
  initialValues?: {
    code: string;
    type: "flat" | "percent";
    value: number;
    minOrder: number;
    maxDiscount?: number | null;
    startsAt: string;
    expiresAt: string;
    usageLimit?: number | null;
    isActive: boolean;
  };
  action: (
    prevState: unknown,
    formData: FormData,
  ) => Promise<{ ok: boolean; error: string | null }>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [type, setType] = useState(initialValues?.type ?? "percent");
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      toast.success("Coupon saved.");
      router.push("/admin/coupons");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            name="code"
            required
            className="uppercase"
            defaultValue={initialValues?.code}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as "flat" | "percent")}>
            <SelectTrigger id="type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percent">Percentage</SelectItem>
              <SelectItem value="flat">Flat Amount</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="type" value={type} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            name="value"
            type="number"
            required
            defaultValue={initialValues?.value}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="minOrder">Minimum Order (₹)</Label>
          <Input
            id="minOrder"
            name="minOrder"
            type="number"
            defaultValue={initialValues?.minOrder ?? 0}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maxDiscount">Max Discount (₹, optional)</Label>
          <Input
            id="maxDiscount"
            name="maxDiscount"
            type="number"
            defaultValue={initialValues?.maxDiscount ?? undefined}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="usageLimit">Usage Limit (optional)</Label>
          <Input
            id="usageLimit"
            name="usageLimit"
            type="number"
            defaultValue={initialValues?.usageLimit ?? undefined}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startsAt">Starts At</Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="date"
            defaultValue={toDateInput(initialValues?.startsAt)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="expiresAt">Expires At</Label>
          <Input
            id="expiresAt"
            name="expiresAt"
            type="date"
            required
            defaultValue={toDateInput(initialValues?.expiresAt)}
          />
        </div>
      </div>

      <label className="flex w-fit items-center gap-2 text-sm">
        <Switch name="isActive" defaultChecked={initialValues?.isActive ?? true} /> Active
      </label>

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save Coupon"}
      </Button>
    </form>
  );
}
