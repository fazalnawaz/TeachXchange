const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const feedbackController = require("../controllers/feedbackController");

const router = express.Router();
router.use(protect);

router.get("/session/:sessionId", feedbackController.getSessionFeedback);
router.post("/session/:sessionId", feedbackController.submitFeedback);

module.exports = router;
