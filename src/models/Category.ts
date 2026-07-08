import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seo: {
      title: { type: String },
      description: { type: String },
    },
  },
  { timestamps: true },
);

categorySchema.index({ parent: 1, order: 1 });

export type CategoryDoc = InferSchemaType<typeof categorySchema>;

export const Category: Model<CategoryDoc> =
  models.Category || model<CategoryDoc>("Category", categorySchema);
