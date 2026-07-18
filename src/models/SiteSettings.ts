import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const siteSettingsSchema = new Schema(
  {
    whatsappEnabled: { type: Boolean, default: false },
    whatsappNumber: { type: String, default: "" },
    whatsappMessage: { type: String, default: "" },
  },
  { timestamps: true },
);

export type SiteSettingsDoc = InferSchemaType<typeof siteSettingsSchema>;

export const SiteSettings: Model<SiteSettingsDoc> =
  models.SiteSettings || model<SiteSettingsDoc>("SiteSettings", siteSettingsSchema);
