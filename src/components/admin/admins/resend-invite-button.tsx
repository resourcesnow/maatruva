"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resendAdminInviteAction } from "@/lib/actions/admin/admins";

export function ResendInviteButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const res = await resendAdminInviteAction(userId);
      if (!res.ok) toast.error(res.error ?? "Could not resend invite.");
      else toast.success("Invite email resent.");
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={pending}>
      {pending ? "Sending..." : "Resend invite"}
    </Button>
  );
}
