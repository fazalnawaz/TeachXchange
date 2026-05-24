const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");

const router = express.Router();
router.use(protect);

router.get("/conversations", chatController.getConversations);
router.post("/conversations", chatController.startConversation);
router.get("/unread", chatController.getUnreadCount);
router.get("/:conversationId/messages", chatController.getMessages);
router.post("/:conversationId/messages", chatController.sendMessage);

module.exports = router;
