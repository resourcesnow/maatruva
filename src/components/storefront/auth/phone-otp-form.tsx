"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PhoneOtpForm({ callbackUrl }: { callbackUrl: string }) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to send OTP.");
        return;
      }
      toast.success("OTP sent!");
      setStep("otp");
    });
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Invalid OTP.");
        return;
      }
      toast.success("Welcome!");
      router.push(callbackUrl);
      router.refresh();
    });
  }

  if (step === "phone") {
    return (
      <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
        <Input
          type="tel"
          required
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Sending..." : "Send OTP"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm">Enter the 6-digit code sent to {phone}</p>
      <Input
        type="text"
        inputMode="numeric"
        maxLength={6}
        required
        placeholder="123456"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Verifying..." : "Verify & Continue"}
      </Button>
      <button
        type="button"
        onClick={() => setStep("phone")}
        className="text-muted-foreground text-sm underline"
      >
        Change phone number
      </button>
    </form>
  );
}
