const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const sessionController = require("../controllers/sessionController");

const router = express.Router();
router.use(protect);

router.get("/", sessionController.getSessions);
router.post("/", sessionController.scheduleSession);
router.get("/:id", sessionController.getSession);
router.get("/:id/zego", sessionController.getZegoToken);
router.patch("/:id/confirm", sessionController.confirmSession);
router.patch("/:id/start", sessionController.startSession);
router.patch("/:id/complete", sessionController.completeSession);

module.exports = router;
