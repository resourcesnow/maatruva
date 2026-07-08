import type { Metadata } from "next";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-8">
      <h1 className="font-heading mb-6 text-3xl font-semibold">Terms of Service</h1>
      <div className="text-muted-foreground flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          These placeholder Terms of Service govern your use of the {brand.name} website and the
          purchase of products from us. Replace this content with your actual terms.
        </p>
        <p>
          By placing an order, you agree to provide accurate information and to pay the listed price
          for the products, including applicable taxes and shipping fees.
        </p>
        <p>
          All product images are for illustration; slight variations in handcrafted items are
          expected and are not considered defects.
        </p>
      </div>
    </div>
  );
}
