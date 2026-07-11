import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getAdminUsers } from "@/lib/data/admin/users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserRoleControls } from "@/components/admin/users/user-role-select";
import { PaginationBar } from "@/components/storefront/pagination-bar";
import { SortableHeader } from "@/components/admin/sortable-header";

export const metadata: Metadata = { title: "Users" };
export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const sortField = sp.sortBy ?? "createdAt";
  const sortDir = sp.sortDir === "asc" ? "asc" : "desc";
  const session = await auth();
  const { users, total } = await getAdminUsers({
    q: sp.q,
    page,
    perPage: PER_PAGE,
    sortBy: sp.sortBy,
    sortDir: sp.sortDir,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Users</h1>

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
              <TableHead>
                <SortableHeader
                  label="Name"
                  field="name"
                  basePath="/admin/users"
                  searchParams={sp}
                  currentField={sortField}
                  currentDir={sortDir}
                />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role / Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email ?? "—"}</TableCell>
                <TableCell>
                  <UserRoleControls
                    userId={user.id}
                    userLabel={user.name}
                    role={user.role}
                    isActive={user.isActive}
                    isSelf={session?.user?.id === user.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationBar
        basePath="/admin/users"
        searchParams={sp}
        currentPage={page}
        totalPages={Math.ceil(total / PER_PAGE)}
      />
    </div>
  );
}
