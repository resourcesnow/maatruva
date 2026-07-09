"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const RESEND_COOLDOWN = 30;

export function EmailVerifyStep({
  email,
  password,
  callbackUrl,
  onBack,
}: {
  email: string;
  password: string;
  callbackUrl: string;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const verifyRes = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        toast.error(verifyData.error ?? "Invalid or expired code.");
        return;
      }

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        toast.error(loginData.error ?? "Verified! Please log in.");
        onBack();
        return;
      }

      toast.success("Email verified!");
      router.push(callbackUrl);
      router.refresh();
    });
  }

  function handleResend() {
    startTransition(async () => {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to resend code.");
        return;
      }
      toast.success("Verification code resent.");
      setCooldown(RESEND_COOLDOWN);
    });
  }

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm">
        Enter the 6-digit verification code sent to <span className="font-medium">{email}</span>
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
      <Button type="submit" disabled={pending}>
        {pending ? "Verifying..." : "Verify & Continue"}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="text-muted-foreground underline">
          Back
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || pending}
          className="text-muted-foreground underline disabled:no-underline disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
}
