const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: "General" },
  experience: { type: Number, default: 0 },
  description: { type: String, default: "" },
  proficiency: { type: String, default: "intermediate" },
  verified: { type: Boolean, default: false },
  verifiedScore: { type: Number, default: 0 },
  verifiedAt: { type: Date },
  verificationMethod: { type: String, default: "ai_quiz" },
  verificationCategory: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const badgeSchema = new mongoose.Schema({
  badgeId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  earnedAt: { type: Date, default: Date.now },
});

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  withUser: { type: String, default: "Match" },
  date: { type: Date, default: Date.now },
  status: { type: String, default: "upcoming" },
  notes: { type: String, default: "" },
});

const messageSchema = new mongoose.Schema({
  from: { type: String, default: "Unknown" },
  text: { type: String, default: "" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const learningGoalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: "General" },
  interest: { type: Number, default: 3 },
  goal: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["learner", "teacher", "admin"],
    default: "learner",
  },
  bio: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  website: {
    type: String,
    default: "",
  },
  linkedin: {
    type: String,
    default: "",
  },
  github: {
    type: String,
    default: "",
  },
  rating: {
    type: Number,
    default: 4.8,
  },
  points: {
    type: Number,
    default: 0,
    min: 0,
  },
  badges: [badgeSchema],
  teachingHours: {
    type: Number,
    default: 0,
  },
  learningHours: {
    type: Number,
    default: 0,
  },
  totalSessions: {
    type: Number,
    default: 0,
  },
  skillsExchanged: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  /** Normalized skill names for fast MongoDB matching */
  teachSkills: {
    type: [String],
    default: [],
  },
  learnSkills: {
    type: [String],
    default: [],
  },
  verifiedSkills: {
    type: [String],
    default: [],
  },
  skills: [skillSchema],
  learningGoals: [learningGoalSchema],
  matchHistory: [
    {
      matchRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MatchRequest",
      },
      matchedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
      },
      compatibilityScore: { type: Number, default: 0 },
      exchangeSummary: { type: String, default: "" },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  sessions: [sessionSchema],
  messages: [messageSchema],
});

userSchema.index({ "skills.name": 1 });
userSchema.index({ "learningGoals.name": 1 });
// Single-field indexes only — MongoDB cannot use a compound index on two array fields
userSchema.index({ teachSkills: 1 });
userSchema.index({ learnSkills: 1 });

module.exports = mongoose.model("User", userSchema);