const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const path = require("path");

const app = express();
const authRoutes = require("./router/authRoutrts");
const attendanceRoutes = require("./router/attendanceRoutes");
const employeeRoutes = require("./router/employeeRoutes");

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);

app.get("/api/auth/test", (req, res) => {
  console.log("AUTH TEST HIT");
  res.status(200).json({
    success: true,
    message: "Auth test route working"
  });
});
app.use("/api/attendance", attendanceRoutes);
app.use("/api/employees", employeeRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Attendance API is running"
  });
});


const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is missing");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
};


connectDB().then(() => {
  if (require.main === module) {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  }
}).catch((error) => {
  console.error('MongoDB Connection Error:', error.message);
});

module.exports = app;