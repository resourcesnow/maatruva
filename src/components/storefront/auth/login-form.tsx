"use client";

import { signIn } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PhoneOtpForm } from "./phone-otp-form";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <Tabs defaultValue="google">
        <TabsList className="w-full">
          <TabsTrigger value="google" className="flex-1">
            Email / Google
          </TabsTrigger>
          <TabsTrigger value="phone" className="flex-1">
            Phone OTP
          </TabsTrigger>
        </TabsList>
        <TabsContent value="google" className="pt-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl })}
          >
            Continue with Google
          </Button>
        </TabsContent>
        <TabsContent value="phone" className="pt-4">
          <PhoneOtpForm callbackUrl={callbackUrl} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
