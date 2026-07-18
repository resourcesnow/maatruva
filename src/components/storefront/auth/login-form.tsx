"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmailLoginForm } from "./email-login-form";
import { EmailSignupForm } from "./email-signup-form";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [emailMode, setEmailMode] = useState<"login" | "signup">("login");

  return (
    <div className="border-cream-dark shadow-warm mx-auto flex w-full max-w-sm flex-col gap-6 rounded-2xl border bg-white p-6 sm:p-8">
      <Button
        type="button"
        variant="brand-outline"
        size="lg"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl })}
      >
        Continue with Google
      </Button>

      <div className="text-maroon/40 flex items-center gap-3 text-xs">
        <span className="bg-cream-dark h-px flex-1" />
        or
        <span className="bg-cream-dark h-px flex-1" />
      </div>

      <div className="flex flex-col gap-5">
        <div
          role="tablist"
          aria-label="Login or sign up"
          className="border-cream-dark flex items-center justify-center gap-1 border-b text-sm"
        >
          <button
            type="button"
            role="tab"
            aria-selected={emailMode === "login"}
            onClick={() => setEmailMode("login")}
            className={cn(
              "-mb-px border-b-2 px-3 pb-2 font-medium transition-colors",
              emailMode === "login"
                ? "border-gold text-maroon"
                : "text-maroon/50 hover:text-maroon border-transparent",
            )}
          >
            Log in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={emailMode === "signup"}
            onClick={() => setEmailMode("signup")}
            className={cn(
              "-mb-px border-b-2 px-3 pb-2 font-medium transition-colors",
              emailMode === "signup"
                ? "border-gold text-maroon"
                : "text-maroon/50 hover:text-maroon border-transparent",
            )}
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
