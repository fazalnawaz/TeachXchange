const express = require("express");
const adminController = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

// Every admin route requires a valid token AND the admin role.
router.use(protect, admin);

router.get("/stats", asyncHandler(adminController.getStats));

router.get("/users", asyncHandler(adminController.listUsers));
router.get("/users/:id", asyncHandler(adminController.getUser));
router.patch("/users/:id/status", asyncHandler(adminController.updateUserStatus));
router.patch("/users/:id/role", asyncHandler(adminController.updateUserRole));
router.delete("/users/:id", asyncHandler(adminController.deleteUser));

router.get("/verifications", asyncHandler(adminController.listVerifications));
router.get("/sessions", asyncHandler(adminController.listSessions));

module.exports = router;
