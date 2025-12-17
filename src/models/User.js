import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  experienceLevel: { type: String, default: "Beginner" },
  bio: { type: String },
  // ✅ UPDATED SKILLS SCHEMA
  skills: [
    {
      name: String,
      level: String,
      mode: String,
      verification: {
        type: { type: String, default: "Self-Declared" }, // Can be 'Link' or 'Self-Declared'
        url: { type: String }
      }
    }
  ],
  // ✅ Link Project to User
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }] 
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;