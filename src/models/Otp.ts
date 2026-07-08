import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const otpSchema = new Schema({
  phone: { type: String, required: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ phone: 1 });

export type OtpDoc = InferSchemaType<typeof otpSchema>;

export const Otp: Model<OtpDoc> = models.Otp || model<OtpDoc>("Otp", otpSchema);
