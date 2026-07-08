import { getCategoryTree } from "@/lib/data/categories";
import { HeaderClient } from "./header-client";

export async function Header() {
  const categories = await getCategoryTree();
  return <HeaderClient categories={categories} />;
}
