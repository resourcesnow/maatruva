"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { addressSchema } from "@/lib/zod-schemas/address";
import { profileSchema } from "@/lib/zod-schemas/user";
import { changePasswordSchema } from "@/lib/zod-schemas/auth";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { sendPasswordResetOtp, applyPasswordResetWithOtp } from "@/lib/password-reset";

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
    phone: formData.get("phone") || "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const user = await requireUser();
  user.name = parsed.data.name;
  if (parsed.data.phone) user.phone = parsed.data.phone;

  try {
    await user.save();
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === 11000) {
      return { ok: false, error: "That phone number is already in use by another account." };
    }
    throw err;
  }

  revalidatePath("/account/profile");
  return { ok: true, error: null };
}

export async function updateProfilePictureAction(url: string, publicId: string) {
  const user = await requireUser();

  const oldPublicId = user.imagePublicId;
  user.image = url;
  user.imagePublicId = publicId;
  await user.save();

  if (oldPublicId && oldPublicId !== publicId) {
    await destroyCloudinaryAsset(oldPublicId).catch((err) =>
      console.error("[cloudinary] failed to delete", oldPublicId, err),
    );
  }

  revalidatePath("/account/profile");
  return { ok: true, error: null };
}

export async function removeProfilePictureAction() {
  const user = await requireUser();

  const oldPublicId = user.imagePublicId;
  user.image = undefined;
  user.imagePublicId = undefined;
  await user.save();

  if (oldPublicId) {
    await destroyCloudinaryAsset(oldPublicId).catch((err) =>
      console.error("[cloudinary] failed to delete", oldPublicId, err),
    );
  }

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

export async function updateAddressAction(
  addressId: string,
  _prevState: unknown,
  formData: FormData,
) {
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
  const address = user.addresses.find((a) => a._id?.toString() === addressId);
  if (!address) return { ok: false, error: "Address not found." };

  if (parsed.data.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }
  Object.assign(address, parsed.data);
  await user.save();
  revalidatePath("/account/addresses");
  return { ok: true, error: null };
}

// Same OTP-to-email mechanism as the public forgot-password flow (src/lib/password-reset.ts),
// but the email is always derived from the current session — never client-supplied — so a
// logged-in user can only ever change their own password this way.
export async function requestPasswordChangeOtpAction() {
  const user = await requireUser();
  if (!user.email) return { ok: false, error: "No email on this account." };

  try {
    await sendPasswordResetOtp(user.email);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to send code." };
  }
  return { ok: true, error: null };
}

export async function confirmPasswordChangeAction(_prevState: unknown, formData: FormData) {
  const parsed = changePasswordSchema.safeParse({
    code: formData.get("code"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const user = await requireUser();
  if (!user.email) return { ok: false, error: "No email on this account." };

  const ok = await applyPasswordResetWithOtp(user.email, parsed.data.code, parsed.data.password);
  if (!ok) return { ok: false, error: "Invalid or expired code." };

  return { ok: true, error: null };
}
