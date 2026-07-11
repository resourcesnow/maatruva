import { config } from "dotenv";
config();

import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { hashPassword } from "../src/lib/password";
import { createResetToken } from "../src/lib/otp";
import { brand } from "../src/lib/brand";

// Bootstraps the first super_admin — deliberately NOT exposed as a public route or in-app
// action, since nothing can grant super_admin before one exists. Run manually:
//   npx tsx scripts/promote-super-admin.ts <email> [password]
// If no password is given, a set-password link is printed instead (same flow as inviting a
// new admin from the dashboard).
async function main() {
  const email = (process.argv[2] ?? process.env.SEED_ADMIN_EMAIL)?.toLowerCase().trim();
  const password = process.argv[3];

  if (!email) {
    console.error("Usage: npx tsx scripts/promote-super-admin.ts <email> [password]");
    process.exit(1);
  }

  await connectDB();

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: "Super Admin",
      email,
      role: "super_admin",
      emailVerified: new Date(),
    });
    console.log(`Created new user ${email} as super_admin.`);
  } else {
    user.role = "super_admin";
    if (!user.emailVerified) user.emailVerified = new Date();
    await user.save();
    console.log(`Promoted existing user ${email} to super_admin.`);
  }

  if (password) {
    user.password = hashPassword(password);
    await user.save();
    console.log("Password set directly from CLI argument.");
  } else if (!user.password) {
    const token = await createResetToken(email);
    const url = `${brand.siteUrl}/admin/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
    console.log("No password set yet. Use this link to set one (expires in 45 minutes):");
    console.log(url);
  } else {
    console.log("This account already has a password — leaving it unchanged.");
  }

  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
