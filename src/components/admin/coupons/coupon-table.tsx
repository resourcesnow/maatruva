import Link from "next/link";
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
import { deleteCouponAction } from "@/lib/actions/admin/coupons";

type Row = {
  _id: string;
  code: string;
  type: "flat" | "percent";
  value: number;
  usedCount: number;
  usageLimit?: number | null;
  isActive: boolean;
  expiresAt: string;
};

export function CouponTable({ coupons }: { coupons: Row[] }) {
  if (coupons.length === 0) {
    return (
      <div className="border-border text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
        No coupons yet.
      </div>
    );
  }

  return (
    <div className="border-border overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon._id}>
              <TableCell className="font-medium">{coupon.code}</TableCell>
              <TableCell>
                {coupon.type === "percent" ? `${coupon.value}%` : `₹${coupon.value}`}
              </TableCell>
              <TableCell>
                {coupon.usedCount}
                {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(coupon.expiresAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge variant={coupon.isActive ? "default" : "secondary"}>
                  {coupon.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/admin/coupons/${coupon._id}`} />}
                  >
                    Edit
                  </Button>
                  <form action={deleteCouponAction.bind(null, coupon._id)}>
                    <Button type="submit" variant="destructive" size="sm">
                      Delete
                    </Button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
