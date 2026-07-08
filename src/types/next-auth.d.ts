import type { DefaultSession } from "next-auth";

export type UserRole = "admin" | "shop_manager" | "customer";

// next-auth's own "next-auth" and "next-auth/jwt" entry points only
// re-export types from @auth/core, so augmentation must target @auth/core
// directly for it to merge into the types actually used by callbacks.
declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: UserRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
