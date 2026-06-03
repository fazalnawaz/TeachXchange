/**
 * Create or promote an admin user.
 *
 * Usage:
 *   node scripts/createAdmin.js <email> <password> [firstName] [lastName]
 *
 * - If a user with the email exists, it is promoted to role "admin"
 *   (and re-activated). The password is updated only if you pass one.
 * - Otherwise a new admin user is created.
 *
 * Run from the server/ directory so .env is picked up.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function main() {
  const [, , email, password, firstName, lastName] = process.argv;

  if (!email || !password) {
    console.error(
      "Usage: node scripts/createAdmin.js <email> <password> [firstName] [lastName]"
    );
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const hashed = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = "admin";
    existing.accountStatus = "active";
    if (password) existing.password = hashed;
    await existing.save();
    console.log(`Promoted existing user to admin: ${email}`);
  } else {
    await User.create({
      firstName: firstName || "Admin",
      lastName: lastName || "User",
      email,
      password: hashed,
      role: "admin",
      accountStatus: "active",
      isVerified: true,
    });
    console.log(`Created new admin user: ${email}`);
  }

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
