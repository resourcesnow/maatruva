"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { addressSchema } from "@/lib/zod-schemas/address";
import { profileSchema } from "@/lib/zod-schemas/user";

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) throw new Error("User not found");
  return user;
}

export async function updateProfileAction(_prevState: unknown, formData: FormData) {
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const user = await requireUser();
  user.name = parsed.data.name;
  await user.save();
  revalidatePath("/account/profile");
  return { ok: true, error: null };
}

export async function addAddressAction(_prevState: unknown, formData: FormData) {
  const parsed = addressSchema.safeParse({
    label: formData.get("label") || "Home",
    line1: formData.get("line1"),
    line2: formData.get("line2") || "",
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
    phone: formData.get("phone"),
    isDefault: formData.get("isDefault") === "on",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const user = await requireUser();
  if (parsed.data.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }
  user.addresses.push(parsed.data);
  await user.save();
  revalidatePath("/account/addresses");
  return { ok: true, error: null };
}

export async function deleteAddressAction(addressId: string) {
  const user = await requireUser();
  user.addresses = user.addresses.filter(
    (a) => a._id?.toString() !== addressId,
  ) as typeof user.addresses;
  await user.save();
  revalidatePath("/account/addresses");
}

export async function setDefaultAddressAction(addressId: string) {
  const user = await requireUser();
  user.addresses.forEach((addr) => {
    addr.isDefault = addr._id?.toString() === addressId;
  });
  await user.save();
  revalidatePath("/account/addresses");
}
