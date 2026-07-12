import { getCategoryTree } from "@/lib/data/categories";
import { getHomeContent } from "@/lib/data/home-content";
import { HeaderClient } from "./header-client";

export async function Header() {
  const [categories, content] = await Promise.all([getCategoryTree(), getHomeContent()]);
  return <HeaderClient categories={categories} logoImage={content?.brandStatement?.image ?? ""} />;
}
