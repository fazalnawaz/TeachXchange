const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const connectionController = require("../controllers/connectionController");

const router = express.Router();
router.use(protect);

router.get("/", connectionController.getConnections);
router.get("/pending", connectionController.getPendingConnections);

module.exports = router;
