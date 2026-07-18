"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { requestPasswordChangeOtpAction, confirmPasswordChangeAction } from "@/lib/actions/account";

const initialState = { ok: false, error: null as string | null };

export function ChangePasswordCard({ email }: { email: string }) {
  const [step, setStep] = useState<"idle" | "code">("idle");
  const [pending, startTransition] = useTransition();
  const [state, formAction, formPending] = useActionState(
    confirmPasswordChangeAction,
    initialState,
  );

  useEffect(() => {
    if (state.ok) {
      toast.success("Password changed.");
      setStep("idle");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  function handleSendCode() {
    startTransition(async () => {
      const res = await requestPasswordChangeOtpAction();
      if (!res.ok) {
        toast.error(res.error ?? "Failed to send code.");
        return;
      }
      toast.success(`Verification code sent to ${email}.`);
      setStep("code");
    });
  }

  if (step === "idle") {
    return (
      <div className="border-border flex max-w-md items-center justify-between rounded-xl border p-4">
        <div>
          <p className="text-sm font-medium">Password</p>
          <p className="text-muted-foreground text-sm">Change your account password.</p>
        </div>
        <Button variant="brand-outline" onClick={handleSendCode} disabled={pending}>
          {pending ? "Sending..." : "Change password"}
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="border-border flex max-w-md flex-col gap-3 rounded-xl border p-4"
    >
      <p className="text-muted-foreground text-sm">
        Enter the 6-digit code sent to <span className="font-medium">{email}</span>, along with your
        new password.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">Verification code</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          maxLength={6}
          required
          placeholder="123456"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">New password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="brand" disabled={formPending}>
          {formPending ? "Updating..." : "Update password"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setStep("idle")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
