import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data/site-settings";
import { SiteSettingsForm } from "@/components/admin/settings/site-settings-form";

export const metadata: Metadata = { title: "Site Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Site Settings</h1>
      <SiteSettingsForm
        initial={{
          whatsappEnabled: settings?.whatsappEnabled ?? false,
          whatsappNumber: settings?.whatsappNumber ?? "",
          whatsappMessage: settings?.whatsappMessage ?? "",
        }}
      />
    </div>
  );
}
