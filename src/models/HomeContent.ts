import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const homeContentSchema = new Schema(
  {
    heroSlides: {
      type: [
        {
          image: { type: String },
          publicId: { type: String },
          video: { type: String },
          heading: { type: String },
          subheading: { type: String },
          ctaLabel: { type: String },
          ctaHref: { type: String },
          order: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    featuredBanners: {
      type: [
        {
          image: { type: String },
          publicId: { type: String },
          title: { type: String },
          mrp: { type: Number },
          salePrice: { type: Number },
          ctaLabel: { type: String },
          ctaHref: { type: String },
        },
      ],
      default: [],
    },
    founders: {
      type: [
        {
          name: { type: String },
          role: { type: String },
          photo: { type: String },
          photoPublicId: { type: String },
          message: { type: String },
        },
      ],
      default: [],
    },
    whyChooseUs: {
      type: [
        {
          icon: { type: String },
          title: { type: String },
          text: { type: String },
        },
      ],
      default: [],
    },
    faq: {
      type: [
        {
          q: { type: String },
          a: { type: String },
        },
      ],
      default: [],
    },
    meta: {
      title: { type: String },
      description: { type: String },
    },
  },
  { timestamps: true },
);

export type HomeContentDoc = InferSchemaType<typeof homeContentSchema>;

export const HomeContent: Model<HomeContentDoc> =
  models.HomeContent || model<HomeContentDoc>("HomeContent", homeContentSchema);
