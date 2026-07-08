import type { Metadata } from "next";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-8">
      <h1 className="font-heading mb-6 text-3xl font-semibold">Refund & Return Policy</h1>
      <div className="text-muted-foreground flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          At {brand.name}, we want you to love your purchase. This is placeholder copy — replace it
          with your actual refund and return policy.
        </p>
        <p>
          Unused items in their original packaging can be returned within 7 days of delivery for a
          full refund or exchange. Custom or personalized items are not eligible for return.
        </p>
        <p>
          Refunds are processed to the original payment method within 5-7 business days of us
          receiving the returned item.
        </p>
      </div>
    </div>
  );
}
