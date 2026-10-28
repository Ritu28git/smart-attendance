
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

const authRoutes = require("./router/authRoutrts");
const attendanceRoutes = require("./router/attendanceRoutes");
const employeeRoutes = require("./router/employeeRoutes");

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/employees", employeeRoutes);

app.get("/api/auth/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth test route working",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Attendance API is running",
  });
});

// Connect to MongoDB
let dbConnectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is missing");
  }

  if (!dbConnectionPromise) {
    dbConnectionPromise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        bufferCommands: false,
      })
      .then(() => {
        console.log("MongoDB Connected Successfully");
      })
      .catch((err) => {
        dbConnectionPromise = null;
        console.error("MongoDB connection failed:", err.message);
        throw err;
      });
  }

  return dbConnectionPromise;
};

// Ensure database is connected before API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database unavailable:", err.message);

    res.status(503).json({
      success: false,
      message: "Database connection failed. Please try again later.",
    });
  }
});

// Local development only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Server startup failed:", err.message);
      process.exit(1);
    });
}

module.exports = app;
