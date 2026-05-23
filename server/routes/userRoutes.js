const express = require("express");
const multer = require("multer");
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, userController.updateProfile);
router.get("/search", protect, userController.searchUsers);
router.get("/sessions", protect, userController.getSessions);
router.get("/messages", protect, userController.getMessages);
router.get("/leaderboard", protect, userController.getLeaderboard);
router.post("/add-teach-skill", protect, userController.addTeachSkill);
router.post("/add-learn-skill", protect, userController.addLearnSkill);
router.get("/unverified-skills", protect, userController.getUnverifiedSkills);
router.post("/verify-skill", protect, upload.single("projectFile"), userController.verifySkill);

module.exports = router;
