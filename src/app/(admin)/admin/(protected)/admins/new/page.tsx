import type { Metadata } from "next";
import { AdminInviteForm } from "@/components/admin/admins/admin-invite-form";

export const metadata: Metadata = { title: "Invite Admin" };
export const dynamic = "force-dynamic";

export default function NewAdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Invite Admin</h1>
      <AdminInviteForm />
    </div>
  );
}
