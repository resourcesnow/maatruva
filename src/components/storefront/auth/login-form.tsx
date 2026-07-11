"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { EmailLoginForm } from "./email-login-form";
import { EmailSignupForm } from "./email-signup-form";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [emailMode, setEmailMode] = useState<"login" | "signup">("login");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl })}
      >
        Continue with Google
      </Button>

      <div className="text-muted-foreground flex items-center gap-3 text-xs">
        <span className="bg-border h-px flex-1" />
        or
        <span className="bg-border h-px flex-1" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-1 text-sm">
          <button
            type="button"
            onClick={() => setEmailMode("login")}
            className={emailMode === "login" ? "font-semibold" : "text-muted-foreground underline"}
          >
            Log in
          </button>
          <span className="text-muted-foreground">/</span>
          <button
            type="button"
            onClick={() => setEmailMode("signup")}
            className={emailMode === "signup" ? "font-semibold" : "text-muted-foreground underline"}
          >
            Sign up
          </button>
        </div>
        {emailMode === "login" ? (
          <EmailLoginForm callbackUrl={callbackUrl} />
        ) : (
          <EmailSignupForm callbackUrl={callbackUrl} />
        )}
      </div>
    </div>
  );
}
