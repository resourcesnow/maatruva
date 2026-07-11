export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "Maatruva",
  tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE || "Handcrafted with love",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  logo: "/brand/logo.svg",
  social: {
    instagram: "https://instagram.com/",
    whatsapp: "https://wa.me/918140555585",
  },
  // TODO: placeholder — replace with the real store address before launch.
  storeAddress: {
    line1: "Maatruva Store address line — TODO",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "000000",
    phone: "+918140555585",
  },
} as const;
