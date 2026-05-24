const asyncHandler = require("../middleware/asyncHandler");
const connectionService = require("../services/connectionService");

exports.getConnections = asyncHandler(async (req, res) => {
  const status = req.query.status || "accepted";
  const connections = await connectionService.getMyConnections(
    req.user._id,
    status === "all" ? null : status
  );
  res.json({ success: true, data: connections });
});

exports.getPendingConnections = asyncHandler(async (req, res) => {
  const connections = await connectionService.getMyConnections(
    req.user._id,
    "pending"
  );
  res.json({ success: true, data: connections });
});
