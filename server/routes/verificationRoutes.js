const express = require("express");
const verificationController = require("../controllers/verificationController");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.get("/stats", protect, asyncHandler(verificationController.getStats));
router.get(
  "/skills/unverified",
  protect,
  asyncHandler(verificationController.getUnverifiedSkills)
);
router.get(
  "/skills",
  protect,
  asyncHandler(verificationController.getAllSkills)
);
router.post(
  "/quiz/start",
  protect,
  asyncHandler(verificationController.startQuiz)
);
router.post(
  "/quiz/submit",
  protect,
  asyncHandler(verificationController.submitQuiz)
);
router.get(
  "/notifications",
  protect,
  asyncHandler(verificationController.getNotifications)
);
router.patch(
  "/notifications/:id/read",
  protect,
  asyncHandler(verificationController.markNotificationRead)
);
router.patch(
  "/notifications/read-all",
  protect,
  asyncHandler(verificationController.markAllNotificationsRead)
);

module.exports = router;
