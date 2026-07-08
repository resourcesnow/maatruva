"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/next-auth";

export function Topbar({ name, role }: { name: string; role: UserRole }) {
  return (
    <header className="border-border bg-background flex h-16 items-center justify-between border-b px-6">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <Badge variant="secondary" className="capitalize">
          {role.replace("_", " ")}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" render={<Link href="/" />}>
          <Store className="size-4" /> View Store
        </Button>
        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="size-4" /> Sign Out
        </Button>
      </div>
    </header>
  );
}
