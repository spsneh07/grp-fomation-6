import mongoose from "mongoose";

// ✅ 1. Define Sub-schema for Skills
const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, default: "Beginner" },
  mode: { type: String, default: "Learner" },
  verification: {
    type: { type: String, default: "Self-Declared" }, 
    url: { type: String, default: "" }
  }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },

  // Profile Fields
  avatarUrl: { type: String }, 
  image: { type: String },     

  jobTitle: { type: String, default: "" },
  bio: { type: String, default: "" },

  // ✅ 2. Add Missing Fields
  experienceLevel: { type: String, default: "Beginner" },
  availability: { type: String, default: "Part-time" },

  // ✅ 3. Use SkillSchema instead of [String]
  skills: { type: [SkillSchema], default: [] },

  socialLinks: {
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    portfolio: { type: String, default: "" }
  },

  preferences: {
    projectInvites: { type: Boolean, default: true },
    newMatches: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  },

  hasCompletedOnboarding: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  resetOtp: String,
  resetOtpExpire: Date,
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);