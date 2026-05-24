const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { syncUserSkillArrays } = require("../utils/syncUserSkills");

const buildProfile = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  name:
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.email ||
    "User",
  email: user.email,
  role: user.role,
  bio: user.bio,
  location: user.location,
  website: user.website,
  linkedin: user.linkedin,
  github: user.github,
  rating: user.rating,
  teachingHours: user.teachingHours,
  learningHours: user.learningHours,
  totalSessions: user.totalSessions,
  skillsExchanged: user.skillsExchanged,
  isVerified: user.isVerified,
  points: user.points || 0,
  badges: user.badges || [],
  skills: user.skills || [],
  learningGoals: user.learningGoals || [],
  teachSkills: user.skills || [],
  learnSkills: user.learningGoals || [],
  sessions: user.sessions,
  messages: user.messages,
});

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    syncUserSkillArrays(user);
    await user.save();
    res.json(buildProfile(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, location, website, linkedin, github } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) {
      const parts = name.trim().split(" ");
      user.firstName = parts.shift();
      user.lastName = parts.join(" ") || user.lastName;
    }

    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.website = website || user.website;
    user.linkedin = linkedin || user.linkedin;
    user.github = github || user.github;

    await user.save();
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { technology } = req.query;
    if (!technology || !technology.trim()) {
      return res.status(400).json({ message: "Technology is required" });
    }

    const regex = new RegExp(technology.trim(), "i");
    const users = await User.find({
      $or: [
        { "skills.name": regex },
        { "skills.category": regex },
        { bio: regex },
        { firstName: regex },
        { lastName: regex },
      ],
    }).select("firstName lastName email role bio location rating skills");

    const results = users.map((user) => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: user.role,
      bio: user.bio,
      location: user.location,
      rating: user.rating,
      skills: user.skills || [],
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("sessions");
    res.json(user.sessions || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("messages");
    res.json(user.messages || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: "teacher" })
      .sort({ rating: -1 })
      .limit(20)
      .select("firstName lastName location rating");

    const results = users.map((user) => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      location: user.location || "Worldwide",
      rating: user.rating,
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addTeachSkill = async (req, res) => {
  try {
    const { name, category, experience, description, proficiency } = req.body;
    if (!name) return res.status(400).json({ message: "Skill name is required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.skills) user.skills = [];
    user.role = "teacher";
    user.skills.push({
      name: String(name).trim(),
      category: category || "General",
      experience: Number(experience) || 0,
      description: description || "",
      proficiency: proficiency || "intermediate",
    });

    syncUserSkillArrays(user);
    await user.save();
    res.status(201).json({
      message: "Teach skill added successfully",
      teachSkills: user.teachSkills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addLearnSkill = async (req, res) => {
  try {
    const { name, category, interest, goal } = req.body;
    if (!name) return res.status(400).json({ message: "Learning goal name is required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.learningGoals) user.learningGoals = [];
    user.learningGoals.push({
      name: String(name).trim(),
      category: category || "General",
      interest: Number(interest) || 3,
      goal: goal || "",
    });

    syncUserSkillArrays(user);
    await user.save();
    res.status(201).json({
      message: "Learning goal saved successfully",
      learnSkills: user.learnSkills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUnverifiedSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("skills");
    const unverified = (user.skills || []).filter((skill) => !skill.verified);
    res.json(unverified);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifySkill = async (req, res) => {
  try {
    const { skillId, method, answers } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const skill = user.skills.id(skillId);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    if (skill.verified) return res.status(400).json({ message: "Skill already verified" });

    let score = 60;
    if (method === 'quiz' && answers) {
      const answerCount = Object.keys(JSON.parse(answers)).length;
      score = Math.min(100, 60 + answerCount * 8 + Math.floor(Math.random() * 11));
    } else if (method === 'project' && req.file) {
      score = 80 + Math.floor(Math.random() * 11);
    } else {
      score = 65 + Math.floor(Math.random() * 15);
    }

    skill.verifiedScore = score;
    skill.verified = score >= 70;

    syncUserSkillArrays(user);
    await user.save();

    res.json({
      score,
      verified: skill.verified,
      message: skill.verified
        ? 'Skill verified successfully'
        : 'Skill verification failed. Please try again.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
