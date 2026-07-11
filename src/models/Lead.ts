import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const leadSchema = new Schema(
  {
    type: { type: String, enum: ["newsletter", "contact"], required: true },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    message: { type: String, default: "" },
    isActioned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type LeadDoc = InferSchemaType<typeof leadSchema>;

export const Lead: Model<LeadDoc> = models.Lead || model<LeadDoc>("Lead", leadSchema);
