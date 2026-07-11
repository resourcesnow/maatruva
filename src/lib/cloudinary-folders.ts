// Central place for Cloudinary folder paths so upload widgets, the signing route, and cleanup
// logic all agree on the exact same structure. Keep folder names in sync with this file only.
export const cloudinaryFolders = {
  product: (productId: string) => `maatruva/products/${productId}`,
  category: (categorySlug: string) => `maatruva/categories/${categorySlug}`,
  homepageBanners: "maatruva/homepage/banners",
  homepageFeatured: "maatruva/homepage/featured",
  homepageFounders: "maatruva/homepage/founders",
  profilePicture: (userId: string) => `maatruva/users/profile-pictures/${userId}`,
  misc: "maatruva/misc",
};

const HOMEPAGE_FOLDERS = [
  cloudinaryFolders.homepageBanners,
  cloudinaryFolders.homepageFeatured,
  cloudinaryFolders.homepageFounders,
];

// Server-side guard used by the signing route: is this user allowed to sign an upload targeting
// this folder? Prevents a tampered client from requesting a signature for someone else's
// profile-picture folder or for catalog folders while not an admin/shop_manager.
export function isFolderAllowedForUser(
  folder: string,
  userId: string,
  role: "super_admin" | "admin" | "shop_manager" | "customer",
) {
  const catalogManager = role === "super_admin" || role === "admin" || role === "shop_manager";
  const admin = role === "super_admin" || role === "admin";

  if (folder.startsWith("maatruva/products/")) return catalogManager;
  if (folder.startsWith("maatruva/categories/")) return admin;
  if (HOMEPAGE_FOLDERS.some((f) => folder.startsWith(f))) return admin;
  if (folder === cloudinaryFolders.misc) return admin;
  if (folder === cloudinaryFolders.profilePicture(userId)) return true; // anyone, own folder only
  return false;
}
