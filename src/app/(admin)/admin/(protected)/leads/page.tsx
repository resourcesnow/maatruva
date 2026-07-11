import type { Metadata } from "next";
import { getAdminLeads } from "@/lib/data/admin/leads";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LeadRow } from "@/components/admin/leads/lead-row";
import { PaginationBar } from "@/components/storefront/pagination-bar";

export const metadata: Metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const type = sp.type === "newsletter" || sp.type === "contact" ? sp.type : undefined;
  const { leads, total } = await getAdminLeads({ type, page, perPage: PER_PAGE });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Leads</h1>

      <div className="flex gap-2">
        <Button
          variant={!type ? "default" : "outline"}
          size="sm"
          render={<a href="/admin/leads" />}
        >
          All
        </Button>
        <Button
          variant={type === "newsletter" ? "default" : "outline"}
          size="sm"
          render={<a href="/admin/leads?type=newsletter" />}
        >
          Newsletter
        </Button>
        <Button
          variant={type === "contact" ? "default" : "outline"}
          size="sm"
          render={<a href="/admin/leads?type=contact" />}
        >
          Contact
        </Button>
      </div>

      {leads.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
          No leads yet.
        </div>
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <LeadRow key={lead.id} lead={lead} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PaginationBar
        basePath="/admin/leads"
        searchParams={sp}
        currentPage={page}
        totalPages={Math.ceil(total / PER_PAGE)}
      />
    </div>
  );
}
