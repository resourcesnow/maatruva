import type { Metadata } from "next";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-8">
      <h1 className="font-heading mb-6 text-3xl font-semibold">Privacy Policy</h1>
      <div className="text-muted-foreground flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          {brand.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy. This placeholder
          policy explains what information we collect, how we use it, and your rights. Replace this
          content with your actual privacy policy via the admin CMS or by editing this page.
        </p>
        <p>
          We collect information you provide during checkout and account creation, including name,
          email, phone number and shipping address, solely to process orders and improve your
          shopping experience.
        </p>
        <p>
          We do not sell your personal data. Payment information is processed securely by Razorpay
          and is never stored on our servers.
        </p>
      </div>
    </div>
  );
}
