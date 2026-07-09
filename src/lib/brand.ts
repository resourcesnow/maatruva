export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "Maatruva",
  tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE || "Handcrafted with love",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  logo: "/brand/logo.svg",
  social: {
    instagram: "https://instagram.com/",
    whatsapp: "https://wa.me/918140555585",
  },
} as const;
