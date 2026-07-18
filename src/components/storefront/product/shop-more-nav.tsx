"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function humanizeSlug(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// A plain history.back() is unsafe here: if someone lands on a product page from a shared
// link, an ad, or search results, there's no meaningful in-app history entry, and back()
// either does nothing or ejects them from the site entirely. document.referrer tells us
// whether the visitor actually navigated here from elsewhere on this site — only then is
// "go back" a real, useful action. Everyone else gets a link to somewhere real instead.
function resolvePrevious() {
  const referrer = document.referrer;
  if (!referrer) return { hasHistory: false, label: "" };

  try {
    const referrerUrl = new URL(referrer);
    if (referrerUrl.origin !== window.location.origin) return { hasHistory: false, label: "" };

    const match = referrerUrl.pathname.match(/^\/product-category\/([^/]+)(?:\/([^/]+))?/);
    const label = match ? `Back to ${humanizeSlug(match[2] ?? match[1])}` : "Previous Page";
    return { hasHistory: true, label };
  } catch {
    return { hasHistory: false, label: "" };
  }
}

export function ShopMoreNav({
  categoryHref,
  categoryLabel,
}: {
  categoryHref?: string;
  categoryLabel?: string;
}) {
  const router = useRouter();
  // document.referrer only exists client-side, so the first render (server and client alike)
  // always renders the deterministic fallback link below; the effect then upgrades it to a
  // "go back" button once we know there's real in-app history to go back to.
  const [previous, setPrevious] = useState({ hasHistory: false, label: "" });

  useEffect(() => {
    setPrevious(resolvePrevious());
  }, []);

  const fallbackHref = categoryHref ?? "/shop";
  const fallbackLabel = categoryLabel ? `Back to ${categoryLabel}` : "Back to Shop";

  return (
    <section className="border-border mt-16 flex flex-col gap-3 border-t pt-8 sm:flex-row sm:justify-center">
      <Button
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
        render={<Link href="/shop" />}
      >
        Back to Shop
      </Button>

      {previous.hasHistory ? (
        <Button size="lg" className="w-full sm:w-auto" onClick={() => router.back()}>
          {previous.label}
        </Button>
      ) : (
        <Button size="lg" className="w-full sm:w-auto" render={<Link href={fallbackHref} />}>
          {fallbackLabel}
        </Button>
      )}
    </section>
  );
}
