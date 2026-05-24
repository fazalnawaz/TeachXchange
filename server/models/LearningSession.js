const mongoose = require("mongoose");

const learningSessionSchema = new mongoose.Schema(
  {
    connectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    title: { type: String, required: true },
    teachSkill: { type: String, default: "" },
    learnSkill: { type: String, default: "" },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    confirmedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    roomId: { type: String, unique: true, sparse: true },
    notes: { type: String, default: "" },
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

learningSessionSchema.index({ participants: 1, scheduledAt: 1 });

module.exports = mongoose.model("LearningSession", learningSessionSchema);
