import type { Metadata } from "next";
import { getAdminReviews } from "@/lib/data/admin/reviews";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/admin/reviews/review-card";
import { PaginationBar } from "@/components/storefront/pagination-bar";

export const metadata: Metadata = { title: "Reviews" };
export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status as "pending" | "approved" | undefined;
  const page = Number(sp.page) || 1;
  const { reviews, total } = await getAdminReviews({ status, q: sp.q, page, perPage: PER_PAGE });

  function statusHref(next?: string) {
    const params = new URLSearchParams();
    if (next) params.set("status", next);
    if (sp.q) params.set("q", sp.q);
    const qs = params.toString();
    return `/admin/reviews${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Reviews</h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button
            variant={!status ? "default" : "outline"}
            size="sm"
            render={<a href={statusHref()} />}
          >
            All
          </Button>
          <Button
            variant={status === "pending" ? "default" : "outline"}
            size="sm"
            render={<a href={statusHref("pending")} />}
          >
            Pending
          </Button>
          <Button
            variant={status === "approved" ? "default" : "outline"}
            size="sm"
            render={<a href={statusHref("approved")} />}
          >
            Approved
          </Button>
        </div>

        <form method="get" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <Input
            name="q"
            placeholder="Search title or comment..."
            defaultValue={sp.q}
            className="max-w-xs"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </div>

      {reviews.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
          No reviews found.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ul>
      )}

      <PaginationBar
        basePath="/admin/reviews"
        searchParams={sp}
        currentPage={page}
        totalPages={Math.ceil(total / PER_PAGE)}
      />
    </div>
  );
}
