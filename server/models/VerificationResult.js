const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    selectedIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const verificationResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    skillId: { type: mongoose.Schema.Types.ObjectId, required: true },
    skillName: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    totalQuestions: { type: Number, default: 5 },
    correctAnswers: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["PASSED", "FAILED"],
      required: true,
    },
    answers: [answerSchema],
    modelUsed: { type: String, default: "google/flan-t5-large" },
    source: { type: String, enum: ["ai", "fallback"], default: "ai" },
    timeTakenSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VerificationResult", verificationResultSchema);
