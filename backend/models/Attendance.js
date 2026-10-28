const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
    },
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    // Indicates if employee was late for check‑in (after office start time)
    late: { type: Boolean, default: false },
    lunchStart: { type: Date, default: null },
    lunchEnd: { type: Date, default: null },
    lunchMinutes: { type: Number, default: 0 },
    overBreak: { type: Boolean, default: false },
    status: { type: String, enum: ['present', 'checked-in', 'checked-out'], default: 'present' },
    faceHash: { type: String },
    location: {
      latitude: Number,
      longitude: Number,
    },
    photoPath: { type: String },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
