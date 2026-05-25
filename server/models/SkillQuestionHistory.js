const mongoose = require("mongoose");

const skillQuestionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    skillId: { type: mongoose.Schema.Types.ObjectId, required: true },
    skillName: { type: String, required: true, index: true },
    skillKey: { type: String, required: true },
    questionHashes: [{ type: String }],
    conceptTags: [{ type: String }],
    sessionSeed: { type: String },
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: "VerificationAttempt" },
  },
  { timestamps: true }
);

skillQuestionHistorySchema.index({ userId: 1, skillName: 1 });

module.exports = mongoose.model("SkillQuestionHistory", skillQuestionHistorySchema);
