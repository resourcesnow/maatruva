import { config } from "dotenv";
config();

import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Coupon } from "../src/models/Coupon";
import { HomeContent } from "../src/models/HomeContent";

// Bootstraps users, coupons, and homepage CMS content only.
// Categories/Products come from `npm run import:products` (real catalog data).

function placeholderImage(seed: string, w = 900, h = 900) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

async function main() {
  await connectDB();
  console.log("Connected. Seeding...");

  // --- Users (bootstrap admin/manager/customer only) ---
  const userDefs = [
    {
      name: "Admin",
      email: process.env.SEED_ADMIN_EMAIL || "admin@example.com",
      phone: process.env.SEED_ADMIN_PHONE || "+919999999999",
      role: "admin",
      emailVerified: new Date(),
      phoneVerified: new Date(),
    },
    {
      name: "Shop Manager",
      email: process.env.SEED_SHOP_MANAGER_EMAIL || "manager@example.com",
      role: "shop_manager",
      emailVerified: new Date(),
    },
    {
      name: "Customer",
      email: process.env.SEED_CUSTOMER_EMAIL || "customer@example.com",
      role: "customer",
      emailVerified: new Date(),
      addresses: [
        {
          label: "Home",
          line1: "221B Baker Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          phone: "+919999999998",
          isDefault: true,
        },
      ],
    },
  ];

  for (const def of userDefs) {
    await User.findOneAndUpdate(
      { email: def.email },
      { $setOnInsert: def },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }
  console.log("Users bootstrapped.");

  // --- Coupons ---
  const couponDefs = [
    {
      code: "RAKHI10",
      type: "percent",
      value: 10,
      minOrder: 499,
      maxDiscount: 300,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: "FLAT100",
      type: "flat",
      value: 100,
      minOrder: 999,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ];

  for (const def of couponDefs) {
    await Coupon.findOneAndUpdate(
      { code: def.code },
      { $setOnInsert: def },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }
  console.log("Coupons bootstrapped.");

  // --- Home content (only if none exists yet) ---
  const existingContent = await HomeContent.findOne();
  if (!existingContent) {
    await HomeContent.create({
      heroSlides: [
        {
          image: placeholderImage("hero-1", 1600, 900),
          heading: "Tie a Rakhi Made With Love",
          subheading: "Handcrafted Rakhis & jewellery, made for the ones who matter.",
          ctaLabel: "Shop Rakhis",
          ctaHref: "/product-category/rakhi",
          order: 0,
        },
        {
          image: placeholderImage("hero-2", 1600, 900),
          heading: "Jewellery That Tells a Story",
          subheading: "Handcrafted with care for every celebration.",
          ctaLabel: "Shop All",
          ctaHref: "/shop",
          order: 1,
        },
      ],
      featuredBanners: [
        {
          image: placeholderImage("banner-bhai", 1200, 800),
          title: "Bhai Rakhi Collection",
          mrp: 249,
          salePrice: 199,
          ctaLabel: "Shop Now",
          ctaHref: "/product-category/rakhi/bhai-rakhi",
        },
        {
          image: placeholderImage("banner-silver", 1200, 800),
          title: "Silver Rakhi Collection",
          mrp: 499,
          salePrice: 400,
          ctaLabel: "Shop Now",
          ctaHref: "/product-category/rakhi/silver-rakhi",
        },
      ],
      founders: [
        {
          name: "Founder Name",
          role: "Founder",
          photo: placeholderImage("founder-1", 400, 400),
          message:
            "Handcrafted with care for every celebration — placeholder founder message, replace via the CMS.",
        },
      ],
      whyChooseUs: [
        {
          icon: "Sparkles",
          title: "Handcrafted",
          text: "Every piece made with care by skilled artisans.",
        },
        {
          icon: "Truck",
          title: "Fast Delivery",
          text: "Pan-India shipping, delivered on time for the festival.",
        },
        {
          icon: "ShieldCheck",
          title: "Quality Assured",
          text: "Premium materials, checked for quality.",
        },
        { icon: "Heart", title: "Made With Love", text: "Designs inspired by tradition and love." },
      ],
      faq: [
        { q: "How long does delivery take?", a: "Typically 3-5 business days across India." },
        { q: "Do you offer Cash on Delivery?", a: "Yes, COD is available on select pincodes." },
        { q: "Can I return a product?", a: "Yes, within 7 days of delivery for unused items." },
        { q: "Are the Rakhis handmade?", a: "Yes, every Rakhi is handcrafted by our artisans." },
        { q: "Do you ship internationally?", a: "Currently we only ship within India." },
        {
          q: "How do I track my order?",
          a: "You'll receive a tracking link via email/SMS after dispatch.",
        },
        {
          q: "Is Cash on Delivery available for jewellery?",
          a: "Yes, subject to order value limits.",
        },
        {
          q: "Can I customize a Rakhi?",
          a: "Custom orders are available on request via contact us.",
        },
        {
          q: "What payment methods do you accept?",
          a: "Cards, UPI, netbanking and wallets via Razorpay.",
        },
        {
          q: "How do I contact support?",
          a: "Reach us via WhatsApp or the contact form in the footer.",
        },
      ],
      meta: {
        title: "Maatruva — Handcrafted Rakhi & Jewellery",
        description: "Handcrafted with care for every celebration.",
      },
    });
    console.log("Home content seeded.");
  } else {
    console.log("Home content already exists, skipping.");
  }

  console.log("Seed complete.");
  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
