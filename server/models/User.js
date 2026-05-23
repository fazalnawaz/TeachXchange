const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: "General" },
  experience: { type: Number, default: 0 },
  description: { type: String, default: "" },
  proficiency: { type: String, default: "intermediate" },
  verified: { type: Boolean, default: false },
  verifiedScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
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
  skills: [skillSchema],
  learningGoals: [learningGoalSchema],
  sessions: [sessionSchema],
  messages: [messageSchema],
});

module.exports = mongoose.model("User", userSchema);