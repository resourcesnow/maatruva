"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Ticket,
  Star,
  FileText,
  UserCog,
  Inbox,
  ShieldCheck,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/next-auth";

const ALL_LINKS: { href: string; label: string; icon: LucideIcon; roles: UserRole[] }[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "admin", "shop_manager"],
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
    roles: ["super_admin", "admin", "shop_manager"],
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: FolderTree,
    roles: ["super_admin", "admin"],
  },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, roles: ["super_admin", "admin"] },
  { href: "/admin/customers", label: "Customers", icon: Users, roles: ["super_admin", "admin"] },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket, roles: ["super_admin", "admin"] },
  { href: "/admin/reviews", label: "Reviews", icon: Star, roles: ["super_admin", "admin"] },
  { href: "/admin/leads", label: "Leads", icon: Inbox, roles: ["super_admin", "admin"] },
  { href: "/admin/content", label: "Content", icon: FileText, roles: ["super_admin", "admin"] },
  { href: "/admin/users", label: "Users", icon: UserCog, roles: ["super_admin", "admin"] },
  { href: "/admin/admins", label: "Manage Admins", icon: ShieldCheck, roles: ["super_admin"] },
  {
    href: "/admin/audit-log",
    label: "Audit Log",
    icon: ScrollText,
    roles: ["super_admin", "admin"],
  },
];

export function AdminNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const links = ALL_LINKS.filter((l) => l.roles.includes(role));

  return (
    <nav className="flex flex-col gap-1 p-3">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
