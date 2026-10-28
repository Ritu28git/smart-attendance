
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },
    department: {
      type: String,
      default: "",
    },
         passwordResetToken: {
      type: String,
      default: undefined,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      default: undefined,
      select: false,
    },

lastLocation: {
  latitude: { type: Number },
  longitude: { type: Number },
  accuracy: { type: Number },
  updatedAt: { type: Date },
},
    designation: { type: String, default: "" },
    // 128-number face-recognition embedding captured during admin registration.
    faceDescriptor: { type: [Number], default: [], select: false },
    faceEnrolledAt: { type: Date, default: null },
    faceHash: { type: String, default: "" },
    isActive: {
      type: Boolean,
      default: true,
    },
  },


  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
