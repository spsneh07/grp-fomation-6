import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  
  // ⚠️ CHANGE THIS: Password must NOT be required (for Google Login)
  password: { 
    type: String, 
    required: false 
  },
  
  // Profile Fields
  avatarUrl: { type: String },
  jobTitle: { type: String, default: "" },
  bio: { type: String, default: "" },
  
  // Logic Flag
  hasCompletedOnboarding: { type: Boolean, default: false },

  // OTP Fields
  resetOtp: String,       
  resetOtpExpire: Date,   
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);