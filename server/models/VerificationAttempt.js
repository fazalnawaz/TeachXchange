const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    questionType: { type: String, default: "theory" },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    hasCode: { type: Boolean, default: false },
    questionHash: { type: String },
    conceptTag: { type: String },
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
    skillKey: { type: String, default: "general" },
    skillCategory: { type: String, default: "general" },
    sessionSeed: { type: String },
    askedConcepts: [{ type: String }],
    categoryLabel: { type: String, default: "General Skills" },
    profileCategory: { type: String, default: "General" },
    proficiency: { type: String, default: "intermediate" },
    questions: [questionSchema],
    modelUsed: { type: String, default: "mistralai/Mistral-7B-Instruct-v0.2" },
    source: { type: String, enum: ["ai"], default: "ai" },
    submitted: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

verificationAttemptSchema.index({ userId: 1, skillName: 1 });

module.exports = mongoose.model("VerificationAttempt", verificationAttemptSchema);
