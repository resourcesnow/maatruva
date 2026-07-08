import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Topbar } from "@/components/admin/topbar";
import { brand } from "@/lib/brand";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || !["admin", "shop_manager"].includes(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="border-border bg-secondary/30 hidden w-60 shrink-0 flex-col border-r md:flex">
        <div className="border-border flex h-16 items-center border-b px-4">
          <span className="font-heading text-lg font-semibold">{brand.name} Admin</span>
        </div>
        <AdminNav role={session.user.role} />
      </aside>
      <div className="flex flex-1 flex-col">
        <Topbar name={session.user.name ?? "User"} role={session.user.role} />
        <main className="bg-muted/20 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
