const mongoose = require("mongoose");

const exchangePairSchema = new mongoose.Schema(
  {
    youTeach: String,
    youLearn: String,
    theyTeach: String,
    theyLearn: String,
  },
  { _id: false }
);

/**
 * Persisted mutual exchange matches for fast search/filter.
 */
const storedMatchSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    matchedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    compatibilityScore: { type: Number, default: 0, min: 0, max: 100 },
    exchangePairs: [exchangePairSchema],
    primaryExchange: exchangePairSchema,
    matchedUserSnapshot: {
      name: String,
      bio: String,
      location: String,
      rating: Number,
      role: String,
      isVerified: Boolean,
      teachSkills: [mongoose.Schema.Types.Mixed],
      learnSkills: [mongoose.Schema.Types.Mixed],
      verifiedTeachCount: { type: Number, default: 0 },
    },
    searchText: { type: String, default: "", index: true },
    hasVerifiedExchange: { type: Boolean, default: false },
  },
  { timestamps: true }
);

storedMatchSchema.index({ ownerUserId: 1, matchedUserId: 1 }, { unique: true });
storedMatchSchema.index({ ownerUserId: 1, compatibilityScore: -1 });

module.exports = mongoose.model("StoredMatch", storedMatchSchema);
