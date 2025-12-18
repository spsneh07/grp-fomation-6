import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // ✅ OTP Fields
  resetOtp: String,       // Stores "123456"
  resetOtpExpire: Date,   // When it expires
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);