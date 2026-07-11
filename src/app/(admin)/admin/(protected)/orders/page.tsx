import Link from "next/link";
import type { Metadata } from "next";
import { getAdminOrders } from "@/lib/data/admin/orders";
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
import { OrderStatusBadge } from "@/components/storefront/order/order-status-badge";
import { PaginationBar } from "@/components/storefront/pagination-bar";
import { SortableHeader } from "@/components/admin/sortable-header";
import { formatINR } from "@/lib/format";
import type { OrderSummary } from "@/types/order";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const sortField = sp.sortBy ?? "createdAt";
  const sortDir = sp.sortDir === "asc" ? "asc" : "desc";
  const { orders, total } = await getAdminOrders({
    q: sp.q,
    status: sp.status,
    page,
    perPage: PER_PAGE,
    sortBy: sp.sortBy,
    sortDir: sp.sortDir,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Orders</h1>

      <form method="get" className="flex gap-2">
        <Input
          name="q"
          placeholder="Search by order number..."
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
                  label="Order"
                  field="orderNo"
                  basePath="/admin/orders"
                  searchParams={sp}
                  currentField={sortField}
                  currentDir={sortDir}
                />
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>
                <SortableHeader
                  label="Total"
                  field="total"
                  basePath="/admin/orders"
                  searchParams={sp}
                  currentField={sortField}
                  currentDir={sortDir}
                />
              </TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <SortableHeader
                  label="Date"
                  field="createdAt"
                  basePath="/admin/orders"
                  searchParams={sp}
                  currentField={sortField}
                  currentDir={sortDir}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(orders as OrderSummary[]).map((order) => (
              <TableRow key={order._id}>
                <TableCell>
                  <Link href={`/admin/orders/${order._id}`} className="font-medium hover:underline">
                    #{order.orderNo}
                  </Link>
                </TableCell>
                <TableCell>{order.shippingAddress.name}</TableCell>
                <TableCell>{formatINR(order.total)}</TableCell>
                <TableCell className="capitalize">{order.payment.status}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationBar
        basePath="/admin/orders"
        searchParams={sp}
        currentPage={page}
        totalPages={Math.ceil(total / PER_PAGE)}
      />
    </div>
  );
}
