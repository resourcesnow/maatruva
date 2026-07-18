"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateSiteSettingsAction } from "@/lib/actions/admin/settings";

const initialState = { ok: false, error: null as string | null };

export function SiteSettingsForm({
  initial,
}: {
  initial: { whatsappEnabled: boolean; whatsappNumber: string; whatsappMessage: string };
}) {
  const [state, formAction, pending] = useActionState(updateSiteSettingsAction, initialState);
  const [enabled, setEnabled] = useState(initial.whatsappEnabled);

  useEffect(() => {
    if (state.ok) {
      toast.success("Settings saved.");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="border-border rounded-xl border p-4">
        <h2 className="font-heading text-lg font-semibold">WhatsApp Chat Button</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Shows a floating WhatsApp button on the homepage so customers can message you directly.
        </p>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <Switch checked={enabled} onCheckedChange={setEnabled} />
          Show WhatsApp button on the homepage
        </label>
        <input type="hidden" name="whatsappEnabled" value={enabled ? "on" : "off"} />

        <div className="mt-4 flex flex-col gap-1.5">
          <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
          <Input
            id="whatsappNumber"
            name="whatsappNumber"
            defaultValue={initial.whatsappNumber}
            placeholder="919876543210"
            inputMode="numeric"
          />
          <p className="text-muted-foreground text-xs">
            Country code + number, digits only — no plus sign or spaces (e.g. 919876543210).
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <Label htmlFor="whatsappMessage">Prefilled Message (optional)</Label>
          <Textarea
            id="whatsappMessage"
            name="whatsappMessage"
            defaultValue={initial.whatsappMessage}
            placeholder="Hi! I'd like to know more about your rakhis."
            rows={3}
          />
        </div>
      </div>

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
