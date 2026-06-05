const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    selectedIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, default: false },
    questionType: { type: String },
    difficulty: { type: String },
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
    skillCategory: { type: String, default: "general" },
    categoryLabel: { type: String, default: "General Skills" },
    score: { type: Number, required: true, min: 0, max: 100 },
    percentage: { type: Number, min: 0, max: 100 },
    totalQuestions: { type: Number, default: 5 },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["PASSED", "FAILED"],
      required: true,
    },
    answers: [answerSchema],
    modelUsed: { type: String, default: "mistralai/Mistral-7B-Instruct-v0.2" },
    source: { type: String, enum: ["ai"], default: "ai" },
    timeTakenSeconds: { type: Number, default: 0 },
    passThreshold: { type: Number, default: 50 },
  },
  { timestamps: true }
);

verificationResultSchema.index({ userId: 1, skillName: 1 });

module.exports = mongoose.model("VerificationResult", verificationResultSchema);
