import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ message: "Sent" }, { status: 200 });

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Save to DB
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes
    await user.save();

    // 3. LOG OTP TO CONSOLE (For testing without email)
    console.log("========================================");
    console.log(`🔐 OTP FOR ${email}: ${otp}`);
    console.log("========================================");

    // TODO: Later, uncomment this to actually send email
    // await sendEmail({ to: email, subject: "Your Code", text: `Your code is ${otp}` });

    return NextResponse.json({ message: "OTP Sent" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}