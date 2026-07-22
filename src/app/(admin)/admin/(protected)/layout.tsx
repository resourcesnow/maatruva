import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { AdminNav } from "@/components/admin/admin-nav";
import { Topbar } from "@/components/admin/topbar";
import { brand } from "@/lib/brand";
import type { UserRole } from "@/types/next-auth";

const ADMIN_ROLES: UserRole[] = ["super_admin", "admin", "shop_manager"];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    redirect("/admin/login");
  }

  // Live re-check against the DB on every admin navigation — the JWT's role/sessionVersion
  // claims can be stale for the token's lifetime. This is the actual enforcement point for
  // role changes, deactivation, and "log out all devices", not the edge middleware.
  await connectDB();
  const freshUser = await User.findById(session.user.id).select(
    "role isActive sessionVersion name",
  );
  if (
    !freshUser ||
    !freshUser.isActive ||
    !ADMIN_ROLES.includes(freshUser.role as UserRole) ||
    freshUser.sessionVersion !== session.user.sessionVersion
  ) {
    redirect("/admin/login");
  }

  const role = freshUser.role as UserRole;

  return (
    <div className="flex min-h-screen">
      <aside className="border-border bg-secondary/30 hidden w-60 shrink-0 flex-col border-r md:flex">
        <div className="border-border flex h-16 items-center border-b px-4">
          <span className="font-heading text-lg font-semibold">{brand.name} Admin</span>
        </div>
        <AdminNav role={role} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={freshUser.name} role={role} />
        <main className="bg-muted/20 min-w-0 flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
