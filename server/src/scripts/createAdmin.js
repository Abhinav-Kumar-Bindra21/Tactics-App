import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import connectDb from "../config/db.js";
import User from "../models/User.js";

async function createAdmin() {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  // Validate the setup before connecting to the database.
  if (!name || !email || !password) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in server/.env");
  }

  if (name.length < 2 || name.length > 80) {
    throw new Error("Admin name must be between 2 and 80 characters.");
  }

  if (password.length < 12 || password.length > 72) {
    throw new Error("Admin password must be between 12 and 72 characters.");
  }

  await connectDb();

  // Never create another admin through this bootstrap script.
  const existingAdmin = await User.exists({ role: "admin" });

  if (existingAdmin) {
    throw new Error("An admin already exists. Bootstrap stopped without changes.");
  }

  // Never convert an existing account into an admin accidentally.
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("This email is already registered. Use a different email.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
    isActive: true,
  });

  console.log("First admin account created successfully.");
  console.log(`Admin email: ${email}`);
}

createAdmin()
  .catch((error) => {
    console.error("Admin bootstrap failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
