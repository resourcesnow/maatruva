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
  productsManage: ["admin", "shop_manager"] as UserRole[],
  categoriesManage: ["admin"] as UserRole[],
  ordersManage: ["admin"] as UserRole[],
  customersView: ["admin"] as UserRole[],
  couponsManage: ["admin"] as UserRole[],
  reviewsModerate: ["admin"] as UserRole[],
  contentManage: ["admin"] as UserRole[],
  usersManage: ["admin"] as UserRole[],
  adminDashboard: ["admin", "shop_manager"] as UserRole[],
};
