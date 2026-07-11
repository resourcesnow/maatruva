import type { Metadata } from "next";
import { getAuditLog } from "@/lib/data/admin/audit-log";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaginationBar } from "@/components/storefront/pagination-bar";

export const metadata: Metadata = { title: "Audit Log" };
export const dynamic = "force-dynamic";

const PER_PAGE = 30;

const ACTION_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  create: "default",
  update: "secondary",
  delete: "destructive",
  status_change: "secondary",
  role_change: "default",
  deactivate: "destructive",
  reactivate: "secondary",
  login: "outline",
  login_failed: "destructive",
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { entries, total, entityTypes } = await getAuditLog({
    entityType: sp.entityType,
    page,
    perPage: PER_PAGE,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Audit Log</h1>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={!sp.entityType ? "default" : "outline"}
          size="sm"
          render={<a href="/admin/audit-log" />}
        >
          All
        </Button>
        {entityTypes.map((type) => (
          <Button
            key={type}
            variant={sp.entityType === type ? "default" : "outline"}
            size="sm"
            render={<a href={`/admin/audit-log?entityType=${type}`} />}
          >
            {type}
          </Button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
          No activity yet.
        </div>
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(entry.at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{entry.actorName}</span>
                    <span className="text-muted-foreground ml-1 text-xs capitalize">
                      ({entry.actorRole.replace("_", " ")})
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={ACTION_VARIANTS[entry.action] ?? "outline"}
                      className="capitalize"
                    >
                      {entry.action.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {entry.entityType}
                  </TableCell>
                  <TableCell className="text-sm">{entry.entityLabel}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PaginationBar
        basePath="/admin/audit-log"
        searchParams={sp}
        currentPage={page}
        totalPages={Math.ceil(total / PER_PAGE)}
      />
    </div>
  );
}
