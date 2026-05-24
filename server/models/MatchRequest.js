const mongoose = require("mongoose");

const exchangePairSchema = new mongoose.Schema(
  {
    requesterTeaches: { type: String, required: true },
    requesterLearns: { type: String, required: true },
    receiverTeaches: { type: String, required: true },
    receiverLearns: { type: String, required: true },
  },
  { _id: false }
);

const matchRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    compatibilityScore: { type: Number, default: 0, min: 0, max: 100 },
    exchangePair: exchangePairSchema,
    message: { type: String, default: "" },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicate pending requests between same users (either direction)
matchRequestSchema.index(
  { fromUserId: 1, toUserId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  }
);

module.exports = mongoose.model("MatchRequest", matchRequestSchema);
