import "server-only";
import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";

export async function getSiteSettings() {
  await connectDB();
  const doc = await SiteSettings.findOne().sort({ createdAt: 1 }).lean();
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as {
    whatsappEnabled: boolean;
    whatsappNumber: string;
    whatsappMessage: string;
  };
}
