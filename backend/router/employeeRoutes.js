
const express = require("express");
const User = require("../models/User");
const { authenticate, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Get real employees from MongoDB
router.get("/", authenticate, adminOnly, async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" })
      .select("name employeeId email department designation isActive")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Fetch employees error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
    });
  }
});

/* Update employee details */
router.put("/:id", authenticate, adminOnly, async (req, res) => {
  try {
    const { name, employeeId, email, department, designation } = req.body;

    if (!name?.trim() || !employeeId?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, Employee ID and email are required.",
      });
    }

    const employee = await User.findOne({
      _id: req.params.id,
      role: "employee",
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Check whether another employee already uses this ID or email
    const duplicate = await User.findOne({
      _id: { $ne: employee._id },
      role: "employee",
      $or: [
        { employeeId: employeeId.trim() },
        { email: email.trim().toLowerCase() },
      ],
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "This Employee ID or email is already in use.",
      });
    }

    employee.name = name.trim();
    employee.employeeId = employeeId.trim();
    employee.email = email.trim().toLowerCase();
    employee.department = department?.trim() || "";
    employee.designation = designation?.trim() || "";

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee details updated successfully.",
      employee: {
        _id: employee._id,
        name: employee.name,
        employeeId: employee.employeeId,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
      },
    });
  } catch (error) {
    console.error("Update employee error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update employee details.",
    });
  }
});

module.exports = router;
