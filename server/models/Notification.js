const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "verification_pass",
        "verification_fail",
        "badge_earned",
        "points_earned",
        "match_request",
        "match_accepted",
        "match_rejected",
        "connection_accepted",
        "connection_rejected",
        "chat_message",
        "session_scheduled",
        "session_confirmed",
        "session_completed",
        "session_reminder",
        "feedback_received",
        "general",
      ],
      default: "general",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
