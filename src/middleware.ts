import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { getRequiredRolesForPath } from "@/lib/rbac";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (pathname.startsWith("/admin")) {
    // Exempt the admin login/reset pages themselves from auth gating entirely.
    if (pathname === "/admin/login" || pathname === "/admin/reset-password") {
      return NextResponse.next();
    }

    if (!session?.user) {
      const loginUrl = new URL("/admin/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const requiredRoles = getRequiredRolesForPath(pathname);
    const allowed = requiredRoles !== null && requiredRoles.includes(session.user.role);
    if (!allowed) {
      // Authenticated but not permitted here — send to their own dashboard, not the login page.
      return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    }
  }

  if (pathname.startsWith("/account")) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
