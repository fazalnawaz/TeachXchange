const express = require("express");
const matchController = require("../controllers/matchController");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.get("/", protect, asyncHandler(matchController.getMatches));
router.post("/refresh", protect, asyncHandler(matchController.refreshMatches));
router.get("/stats", protect, asyncHandler(matchController.getMatchStats));
router.get("/requests", protect, asyncHandler(matchController.getRequests));
router.get("/history", protect, asyncHandler(matchController.getHistory));
router.post("/request", protect, asyncHandler(matchController.sendRequest));
router.patch(
  "/request/:id/accept",
  protect,
  asyncHandler(matchController.acceptRequest)
);
router.patch(
  "/request/:id/reject",
  protect,
  asyncHandler(matchController.rejectRequest)
);

module.exports = router;
