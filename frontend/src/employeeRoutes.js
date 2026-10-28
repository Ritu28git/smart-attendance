
const express = require("express");
const User = require("../models/User");
const { authenticate, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all employees — Admin only
router.get("/", authenticate, adminOnly, async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" })
      .select("-password")
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
// Update employee details
router.put("/:id", authenticate, adminOnly, async (req, res) => {
  try {
    const { name, employeeId, email, department, designation } = req.body;

    const employee = await User.findOneAndUpdate(
      { _id: req.params.id, role: "employee" },
      { name, employeeId, email, department, designation },
      { new: true, runValidators: true }
    ).select("name employeeId email department designation isActive");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully.",
      employee,
    });
  } catch (error) {
    console.error("Update employee error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update employee.",
    });
  }
});

module.exports = router;
