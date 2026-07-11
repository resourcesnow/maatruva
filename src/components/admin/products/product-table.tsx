"use client";

import { useTransition } from "react";
import { SmartImage as Image } from "@/components/ui/smart-image";
import Link from "next/link";
import { toast } from "sonner";
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
import { ConfirmActionDialog } from "@/components/admin/confirm-action-dialog";
import { SortableHeader } from "@/components/admin/sortable-header";
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

function ProductRow({ product }: { product: Row }) {
  const [pending, startTransition] = useTransition();

  function handlePublish() {
    startTransition(async () => {
      const res = await publishProductAction(product._id);
      if (!res.ok) toast.error(res.error ?? "Could not publish product.");
      else toast.success(`"${product.title}" published.`);
    });
  }

  async function handleArchive() {
    const res = await archiveProductAction(product._id);
    if (!res.ok) toast.error(res.error ?? "Could not archive product.");
    else toast.success(`"${product.title}" archived.`);
  }

  async function handleDelete() {
    const res = await deleteProductAction(product._id);
    if (!res.ok) toast.error(res.error ?? "Could not delete product.");
    else toast.success(`"${product.title}" deleted.`);
  }

  return (
    <TableRow>
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
        <span className={product.stock <= product.lowStockThreshold ? "text-destructive" : ""}>
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
            <Button variant="outline" size="sm" onClick={handlePublish} disabled={pending}>
              Publish
            </Button>
          ) : (
            <ConfirmActionDialog
              triggerRender={<Button variant="outline" size="sm" disabled={pending} />}
              triggerLabel="Archive"
              title={`Archive "${product.title}"?`}
              description="This removes it from the storefront. You can publish it again later."
              confirmLabel="Archive"
              onConfirm={handleArchive}
            />
          )}
          <ConfirmActionDialog
            triggerRender={<Button variant="destructive" size="sm" disabled={pending} />}
            triggerLabel="Delete"
            title={`Delete "${product.title}"?`}
            description="This action cannot be undone."
            confirmLabel="Delete"
            onConfirm={handleDelete}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ProductTable({
  products,
  basePath,
  searchParams,
  currentField,
  currentDir,
}: {
  products: Row[];
  basePath: string;
  searchParams: Record<string, string | undefined>;
  currentField: string;
  currentDir: "asc" | "desc";
}) {
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
            <TableHead>
              <SortableHeader
                label="Product"
                field="title"
                basePath={basePath}
                searchParams={searchParams}
                currentField={currentField}
                currentDir={currentDir}
              />
            </TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>
              <SortableHeader
                label="Price"
                field="price"
                basePath={basePath}
                searchParams={searchParams}
                currentField={currentField}
                currentDir={currentDir}
              />
            </TableHead>
            <TableHead>
              <SortableHeader
                label="Stock"
                field="stock"
                basePath={basePath}
                searchParams={searchParams}
                currentField={currentField}
                currentDir={currentDir}
              />
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <ProductRow key={product._id} product={product} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
