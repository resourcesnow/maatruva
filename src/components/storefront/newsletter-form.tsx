"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeNewsletterAction } from "@/lib/actions/lead";

const initialState = { ok: false, error: null as string | null };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeNewsletterAction, initialState);

  useEffect(() => {
    if (state.ok) toast.success("Subscribed! Welcome to the family.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex w-full max-w-sm gap-2">
      <Input
        type="email"
        name="email"
        required
        placeholder="Enter your email"
        className="bg-background"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
}
