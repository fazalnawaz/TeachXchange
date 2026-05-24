const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
  },
  { _id: false }
);

const verificationAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    skillId: { type: mongoose.Schema.Types.ObjectId, required: true },
    skillName: { type: String, required: true },
    proficiency: { type: String, default: "intermediate" },
    questions: [questionSchema],
    modelUsed: { type: String, default: "google/flan-t5-large" },
    source: { type: String, enum: ["ai", "fallback"], default: "ai" },
    submitted: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VerificationAttempt", verificationAttemptSchema);
