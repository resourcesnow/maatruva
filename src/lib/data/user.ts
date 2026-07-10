import "server-only";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function getCurrentUserProfile() {
  const session = await auth();
  if (!session?.user) return null;
  await connectDB();
  const user = await User.findById(session.user.id)
    .select("name email phone image emailVerified phoneVerified role")
    .lean();
  if (!user) return null;

  return {
    name: user.name,
    email: user.email ?? null,
    phone: user.phone ?? null,
    image: user.image ?? null,
    isVerified: Boolean(user.emailVerified || user.phoneVerified),
    role: user.role,
  };
}

export async function getCurrentUserAddresses() {
  const session = await auth();
  if (!session?.user) return [];
  await connectDB();
  const user = await User.findById(session.user.id).select("addresses").lean();
  return (user?.addresses ?? []).map((a) => ({
    id: a._id?.toString() ?? "",
    label: a.label,
    line1: a.line1,
    line2: a.line2 ?? undefined,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    phone: a.phone,
    isDefault: a.isDefault,
  }));
}
