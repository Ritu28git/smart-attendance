
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({
      role: "admin",
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      return;
    }

    const name = (await ask("Admin name: ")).trim();
    const employeeId = (await ask("Admin ID: ")).trim();
    const email = (
      await ask("Admin email: ")
    ).trim().toLowerCase();
    const password = await ask("Admin password (12+ characters): ");

    if (!name || !employeeId || !email || password.length < 12) {
      console.log("Invalid details. Password must be at least 12 characters.");
      return;
    }

    const existingUser = await User.findOne({
      $or: [{ employeeId }, { email }],
    });

    if (existingUser) {
      console.log("This Employee ID or email is already in use.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      employeeId,
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin account created successfully!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    rl.close();
  }
}

createAdmin();
