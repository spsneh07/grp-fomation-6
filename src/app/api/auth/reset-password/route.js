import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp, password } = await req.json();

    // Find user with matching Email AND valid OTP
    const user = await User.findOne({
      email,
      resetOtp: otp,
      resetOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Update Password
    user.password = await bcrypt.hash(password, 10);
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    await user.save();

    return NextResponse.json({ message: "Password updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}