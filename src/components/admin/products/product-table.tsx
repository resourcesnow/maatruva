import Image from "next/image";
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
import {
  archiveProductAction,
  deleteProductAction,
  publishProductAction,
} from "@/lib/actions/admin/products";
import { formatINR } from "@/lib/format";

type Row = {
  _id: string;
  title: string;
  slug: string;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  lowStockThreshold: number;
  status: string;
  images: { url: string }[];
};

export function ProductTable({ products }: { products: Row[] }) {
  if (products.length === 0) {
    return (
      <div className="border-border text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
        No products found.
      </div>
    );
  }

  return (
    <div className="border-border overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {product.images[0] && (
                    <div className="bg-muted relative size-10 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={product.images[0].url}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span className="font-medium">{product.title}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{product.sku}</TableCell>
              <TableCell>
                {formatINR(product.salePrice ?? product.price)}
                {product.salePrice && (
                  <span className="text-muted-foreground ml-1 text-xs line-through">
                    {formatINR(product.price)}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span
                  className={product.stock <= product.lowStockThreshold ? "text-destructive" : ""}
                >
                  {product.stock}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={product.status === "published" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {product.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/admin/products/${product._id}`} />}
                  >
                    Edit
                  </Button>
                  {product.status !== "published" ? (
                    <form action={publishProductAction.bind(null, product._id)}>
                      <Button type="submit" variant="outline" size="sm">
                        Publish
                      </Button>
                    </form>
                  ) : (
                    <form action={archiveProductAction.bind(null, product._id)}>
                      <Button type="submit" variant="outline" size="sm">
                        Archive
                      </Button>
                    </form>
                  )}
                  <form action={deleteProductAction.bind(null, product._id)}>
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
