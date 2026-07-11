"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

const GENERIC_ERROR = "Invalid email or password, or your account is temporarily locked.";

export function AdminLoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [mode, setMode] = useState<"login" | "forgot" | "sent">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await signIn("email-password", { email, password, redirect: false });
      if (!result || result.error) {
        toast.error(GENERIC_ERROR);
        return;
      }
      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    });
  }

  function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setMode("sent");
    });
  }

  if (mode === "sent") {
    return (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm">
          If an account exists for <span className="font-medium">{email}</span>, a reset link has
          been sent.
        </p>
        <button
          type="button"
          onClick={() => setMode("login")}
          className="text-muted-foreground text-sm underline"
        >
          Back to login
        </button>
      </div>
    );
  }

  if (mode === "forgot") {
    return (
      <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
        <Input
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Sending..." : "Send reset link"}
        </Button>
        <button
          type="button"
          onClick={() => setMode("login")}
          className="text-muted-foreground text-sm underline"
        >
          Back to login
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-3">
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
      <Button type="submit" disabled={pending}>
        {pending ? "Logging in..." : "Log in"}
      </Button>
      <button
        type="button"
        onClick={() => setMode("forgot")}
        className="text-muted-foreground text-center text-sm underline"
      >
        Forgot password?
      </button>
    </form>
  );
}
