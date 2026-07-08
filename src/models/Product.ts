import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: null, min: 0 },
    currency: { type: String, default: "INR" },
    categories: { type: [Schema.Types.ObjectId], ref: "Category", default: [] },
    attributes: {
      type: [{ name: { type: String }, value: { type: String } }],
      default: [],
    },
    images: { type: [imageSchema], default: [] },
    video: {
      url: { type: String },
      publicId: { type: String },
    },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    isFeatured: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    badges: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    seo: {
      title: { type: String },
      description: { type: String },
    },
  },
  { timestamps: true },
);

productSchema.index({ categories: 1 });
productSchema.index({ status: 1, isFeatured: 1 });
productSchema.index({ status: 1, isBestseller: 1 });
productSchema.index({ title: "text", description: "text", shortDescription: "text" });

export type ProductDoc = InferSchemaType<typeof productSchema>;

export const Product: Model<ProductDoc> =
  models.Product || model<ProductDoc>("Product", productSchema);
