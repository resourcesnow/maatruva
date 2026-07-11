import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getAdminAccounts } from "@/lib/data/admin/admins";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserRoleControls } from "@/components/admin/users/user-role-select";
import { ResendInviteButton } from "@/components/admin/admins/resend-invite-button";
import { PaginationBar } from "@/components/storefront/pagination-bar";

export const metadata: Metadata = { title: "Manage Admins" };
export const dynamic = "force-dynamic";

const PER_PAGE = 20;
const ALL_ROLES = ["super_admin", "admin", "shop_manager"] as const;

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const session = await auth();
  const { admins, total } = await getAdminAccounts({ q: sp.q, page, perPage: PER_PAGE });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Manage Admins</h1>
        <Button render={<Link href="/admin/admins/new" />}>Invite Admin</Button>
      </div>

      <form method="get" className="flex gap-2">
        <Input
          name="q"
          placeholder="Search by name or email..."
          defaultValue={sp.q}
          className="max-w-xs"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <div className="border-border overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role / Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">{admin.name}</TableCell>
                <TableCell className="text-muted-foreground">{admin.email ?? "—"}</TableCell>
                <TableCell>
                  {admin.hasPassword ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Invited</Badge>
                      <ResendInviteButton userId={admin.id} />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <UserRoleControls
                    userId={admin.id}
                    userLabel={admin.name}
                    role={admin.role}
                    isActive={admin.isActive}
                    isSelf={session?.user?.id === admin.id}
                    availableRoles={[...ALL_ROLES]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationBar
        basePath="/admin/admins"
        searchParams={sp}
        currentPage={page}
        totalPages={Math.ceil(total / PER_PAGE)}
      />
    </div>
  );
}
