const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");

const router = express.Router();
router.use(protect);

router.get("/", notificationController.getNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/:id/read", notificationController.markRead);
router.patch("/read-all", notificationController.markAllRead);

module.exports = router;
