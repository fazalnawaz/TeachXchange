const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    participantKey: {
      type: String,
      required: true,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    matchRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MatchRequest",
    },
    compatibilityScore: { type: Number, default: 0 },
    exchangePair: {
      requesterTeaches: String,
      requesterLearns: String,
      receiverTeaches: String,
      receiverLearns: String,
    },
    connectedAt: { type: Date },
  },
  { timestamps: true }
);

connectionSchema.index(
  { participantKey: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "accepted"] } },
  }
);

connectionSchema.statics.buildParticipantKey = (userIdA, userIdB) =>
  [String(userIdA), String(userIdB)].sort().join("_");

module.exports = mongoose.model("Connection", connectionSchema);
