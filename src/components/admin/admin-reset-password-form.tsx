"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

export function AdminResetPasswordForm({ email, token }: { email: string; token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to reset password.");
        return;
      }
      toast.success("Password updated. Please log in.");
      router.push("/admin/login");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <p className="text-muted-foreground text-xs">
        At least 8 characters, with a letter and a number.
      </p>
      <Button type="submit" disabled={pending}>
        {pending ? "Updating..." : "Set new password"}
      </Button>
    </form>
  );
}
