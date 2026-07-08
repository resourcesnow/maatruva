export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  parent: string | null;
  image?: { url: string; publicId?: string };
  order: number;
  isActive: boolean;
  children: CategoryNode[];
};

export type ProductImage = {
  url: string;
  publicId: string;
  alt: string;
  order: number;
};

export type ProductCard = {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: ProductImage[];
  badges: string[];
  stock: number;
  ratingAvg: number;
  ratingCount: number;
};

export type ProductDetail = ProductCard & {
  sku: string;
  description: string;
  shortDescription: string;
  categories: { id: string; name: string; slug: string }[];
  attributes: { name: string; value: string }[];
  video?: { url: string } | null;
  lowStockThreshold: number;
};
