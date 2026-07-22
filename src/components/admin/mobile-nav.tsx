"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminNav } from "@/components/admin/admin-nav";
import { brand } from "@/lib/brand";
import type { UserRole } from "@/types/next-auth";

export function MobileAdminNav({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden" />}
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-border h-16 justify-center border-b px-4">
          <SheetTitle className="font-heading text-lg font-semibold">{brand.name} Admin</SheetTitle>
        </SheetHeader>
        {/* Closes the drawer on any nav click via bubbling — no change needed to AdminNav itself. */}
        <div onClick={() => setOpen(false)}>
          <AdminNav role={role} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
