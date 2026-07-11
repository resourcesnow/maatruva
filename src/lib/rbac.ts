import type { Session } from "next-auth";
import type { UserRole } from "@/types/next-auth";

export function hasRole(session: Session | null, roles: UserRole[]) {
  return !!session?.user && roles.includes(session.user.role);
}

export function requireRole(session: Session | null, roles: UserRole[]) {
  if (!hasRole(session, roles)) {
    throw new Error("Forbidden: insufficient role.");
  }
}

export const roleMatrix = {
  productsManage: ["super_admin", "admin", "shop_manager"] as UserRole[],
  categoriesManage: ["super_admin", "admin"] as UserRole[],
  ordersManage: ["super_admin", "admin"] as UserRole[],
  customersView: ["super_admin", "admin"] as UserRole[],
  couponsManage: ["super_admin", "admin"] as UserRole[],
  reviewsModerate: ["super_admin", "admin"] as UserRole[],
  contentManage: ["super_admin", "admin"] as UserRole[],
  usersManage: ["super_admin", "admin"] as UserRole[],
  adminDashboard: ["super_admin", "admin", "shop_manager"] as UserRole[],
  adminsManage: ["super_admin"] as UserRole[],
  auditLogView: ["super_admin", "admin"] as UserRole[],
  leadsManage: ["super_admin", "admin"] as UserRole[],
};

// Table for middleware (edge-safe: no Node/Mongoose imports). Longest-prefix-match among
// `/admin/x` sections; the bare `/admin` dashboard route is matched exactly, not as a prefix,
// so any NEW /admin/* route added later without an entry here is default-denied rather than
// silently inheriting dashboard-level access.
export const adminRoutePermissions: { prefix: string; capability: keyof typeof roleMatrix }[] = [
  { prefix: "/admin/admins", capability: "adminsManage" },
  { prefix: "/admin/audit-log", capability: "auditLogView" },
  { prefix: "/admin/leads", capability: "leadsManage" },
  { prefix: "/admin/products", capability: "productsManage" },
  { prefix: "/admin/categories", capability: "categoriesManage" },
  { prefix: "/admin/orders", capability: "ordersManage" },
  { prefix: "/admin/customers", capability: "customersView" },
  { prefix: "/admin/coupons", capability: "couponsManage" },
  { prefix: "/admin/reviews", capability: "reviewsModerate" },
  { prefix: "/admin/content", capability: "contentManage" },
  { prefix: "/admin/users", capability: "usersManage" },
];

export function getRequiredRolesForPath(pathname: string): UserRole[] | null {
  if (pathname === "/admin") return roleMatrix.adminDashboard;

  const match = adminRoutePermissions
    .filter((entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];
  return match ? roleMatrix[match.capability] : null;
}
