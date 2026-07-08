import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const addressSchema = new Schema(
  {
    label: { type: String, default: "Home" },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    emailVerified: { type: Date, default: null },
    phoneVerified: { type: Date, default: null },
    googleId: { type: String },
    image: { type: String },
    role: {
      type: String,
      enum: ["admin", "shop_manager", "customer"],
      default: "customer",
    },
    isActive: { type: Boolean, default: true },
    addresses: { type: [addressSchema], default: [] },
    wishlist: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema>;

export const User: Model<UserDoc> = models.User || model<UserDoc>("User", userSchema);
