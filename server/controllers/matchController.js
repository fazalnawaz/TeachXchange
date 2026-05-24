const matchingService = require("../services/matchingService");
const matchRequestService = require("../services/matchRequestService");

exports.getMatches = async (req, res) => {
  const { search, minScore, limit, refresh, verifiedOnly } = req.query;

  const result = await matchingService.findMatches(req.user._id, {
    search: search || "",
    minScore: Math.max(0, Number(minScore) || 0),
    limit: Math.min(Math.max(Number(limit) || 20, 1), 50),
    refresh: refresh === "true" || refresh === "1",
    verifiedOnly: verifiedOnly === "true" || verifiedOnly === "1",
  });

  res.json({
    success: true,
    ...result,
  });
};

exports.refreshMatches = async (req, res) => {
  const result = await matchingService.findMatches(req.user._id, {
    refresh: true,
    limit: 50,
  });

  res.json({
    success: true,
    message: "Matches refreshed and saved",
    ...result,
  });
};

exports.getMatchStats = async (req, res) => {
  const stats = await matchingService.getMatchStats(req.user._id);
  res.json(stats);
};

exports.getRequests = async (req, res) => {
  const requests = await matchRequestService.getMyRequests(req.user._id);
  res.json(requests);
};

exports.getHistory = async (req, res) => {
  const history = await matchRequestService.getMatchHistory(req.user._id);
  res.json(history);
};

exports.sendRequest = async (req, res) => {
  const { toUserId, message } = req.body;

  if (!toUserId) {
    return res.status(400).json({ message: "toUserId is required" });
  }

  const request = await matchRequestService.sendMatchRequest(
    req.user._id,
    toUserId,
    message || ""
  );

  res.status(201).json({
    message: "Match request sent successfully",
    request,
  });
};

exports.acceptRequest = async (req, res) => {
  const request = await matchRequestService.respondToRequest(
    req.params.id,
    req.user._id,
    "accept"
  );

  res.json({
    message: "Skill exchange match accepted!",
    request,
  });
};

exports.rejectRequest = async (req, res) => {
  const request = await matchRequestService.respondToRequest(
    req.params.id,
    req.user._id,
    "reject"
  );

  res.json({
    message: "Match request declined",
    request,
  });
};
