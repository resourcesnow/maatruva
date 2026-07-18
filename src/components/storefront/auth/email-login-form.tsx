"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { EmailVerifyStep } from "./email-verify-step";
import { ForgotPasswordStep } from "./forgot-password-step";

export function EmailLoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [needsVerification, setNeedsVerification] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "not_verified") {
          toast.error("Please verify your email to continue.");
          setNeedsVerification(true);
          return;
        }
        toast.error(data.error ?? "Failed to log in.");
        return;
      }
      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    });
  }

  if (needsVerification) {
    return (
      <EmailVerifyStep
        email={email}
        password={password}
        callbackUrl={callbackUrl}
        onBack={() => setNeedsVerification(false)}
      />
    );
  }

  if (forgotPassword) {
    return (
      <ForgotPasswordStep
        onBack={() => setForgotPassword(false)}
        onDone={() => setForgotPassword(false)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        type="email"
        required
        placeholder="you@example.com"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <PasswordInput
        required
        placeholder="Password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setForgotPassword(true)}
        className="text-maroon/70 hover:text-maroon -mt-1 self-end text-xs underline underline-offset-2"
      >
        Forgot password?
      </button>
      <Button type="submit" variant="brand" disabled={pending}>
        {pending ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}
