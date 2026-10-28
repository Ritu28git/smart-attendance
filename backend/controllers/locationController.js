
const Attendance = require("../models/Attendance");
const User = require("../models/User");

// Employee ki live location update karna
async function updateMyLocation(req, res) {
  try {
    const { latitude, longitude, accuracy } = req.body || {};

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude required.",
      });
    }

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
      checkIn: { $ne: null },
    });

    if (attendance) {
  attendance.location = { latitude, longitude };
  await attendance.save();
}

    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        lastLocation: {
          latitude,
          longitude,
          accuracy:
            typeof accuracy === "number" && Number.isFinite(accuracy)
              ? accuracy
              : null,
          updatedAt: new Date(),
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Location updated successfully.",
    });
  } catch (err) {
    console.error("Update location error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update location.",
    });
  }
}

// Admin ke liye checked-in employees ki latest locations
async function getLiveEmployeeLocations(req, res) {
  try {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const todayAttendances = await Attendance.find({
      date: today,
      checkIn: { $ne: null },
    }).populate("employee", "name employeeId department designation lastLocation");

    const employeeMap = new Map();

    todayAttendances.forEach((att) => {
      const emp = att.employee;
      if (!emp) return;

      const empIdStr = emp._id.toString();
      const loc = emp.lastLocation?.latitude
        ? emp.lastLocation
        : att.location?.latitude
        ? {
            latitude: att.location.latitude,
            longitude: att.location.longitude,
            accuracy: null,
            updatedAt: att.checkIn,
          }
        : null;

      if (loc) {
  
        employeeMap.set(empIdStr, {
          _id: emp._id,
          name: emp.name,
          employeeId: emp.employeeId,
          department: emp.department || "",
          designation: emp.designation || "",
          lastLocation: loc,
          status: att.checkOut ? "checked-out" : att.lunchStart && !att.lunchEnd ? "on-lunch" : "working",
        });
      }
    });

    const usersWithLocation = await User.find({
      role: "employee",
      "lastLocation.latitude": { $exists: true, $ne: null },
    }).select("name employeeId department designation lastLocation");

    usersWithLocation.forEach((emp) => {
      const empIdStr = emp._id.toString();
      if (!employeeMap.has(empIdStr) && emp.lastLocation) {
        employeeMap.set(empIdStr, {
          _id: emp._id,
          name: emp.name,
          employeeId: emp.employeeId,
          department: emp.department || "",
          designation: emp.designation || "",
          lastLocation: emp.lastLocation,
          status: "active",
        });
      }
    });

    const employees = Array.from(employeeMap.values());

    return res.status(200).json({
      success: true,
      employees,
      locations: employees,
    });
  } catch (err) {
    console.error("Get live locations error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch live locations.",
    });
  }
}

module.exports = {
  updateMyLocation,
  getLiveEmployeeLocations,
};
