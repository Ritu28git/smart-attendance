const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    date: {
      type: String,
      required: true,
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    lunchStart: {
      type: Date,
      default: null,
    },

    lunchEnd: {
      type: Date,
      default: null,
    },

    lunchMinutes: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["present", "checked-out"],
      default: "present",
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  { employee: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);