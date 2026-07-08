import "server-only";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

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
