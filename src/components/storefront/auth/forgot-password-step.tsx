"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

const RESEND_COOLDOWN = 30;

export function ForgotPasswordStep({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function requestCode() {
    startTransition(async () => {
      const res = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to send code.");
        return;
      }
      toast.success("If that account exists, we've sent a code to it.");
      setStep("reset");
      setCooldown(RESEND_COOLDOWN);
    });
  }

  function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    requestCode();
  }

  function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      return;
    }
    setConfirmError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Invalid or expired code.");
        return;
      }
      toast.success("Password updated. Please log in.");
      onDone();
    });
  }

  if (step === "reset") {
    return (
      <form onSubmit={handleResetSubmit} className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          Enter the 6-digit code sent to <span className="font-medium">{email}</span>, along with
          your new password.
        </p>
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <PasswordInput
          required
          placeholder="New password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          required
          placeholder="Confirm new password"
          autoComplete="new-password"
          minLength={8}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (confirmError) setConfirmError(null);
          }}
          aria-invalid={!!confirmError}
        />
        {confirmError && <p className="text-destructive text-xs">{confirmError}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Updating..." : "Update password"}
        </Button>
        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={onBack} className="text-muted-foreground underline">
            Back to login
          </button>
          <button
            type="button"
            onClick={requestCode}
            disabled={cooldown > 0 || pending}
            className="text-muted-foreground underline disabled:no-underline disabled:opacity-50"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequestSubmit} className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm">
        Enter your registered email and we&apos;ll send you a code to reset your password.
      </p>
      <Input
        type="email"
        required
        placeholder="you@example.com"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send code"}
      </Button>
      <button type="button" onClick={onBack} className="text-muted-foreground text-sm underline">
        Back to login
      </button>
    </form>
  );
}
