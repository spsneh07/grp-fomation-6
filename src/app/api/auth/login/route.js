import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; 

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    // ✅ FIX: Explicitly select the password field
    // Some schemas hide the password by default ({ select: false })
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    // Debug Log (Optional: Remove after fixing)
    console.log("🔍 Checking User:", user.email);
    console.log("🔑 Hash from DB:", user.password ? "Found" : "MISSING!");

    if (!user.password) {
        return NextResponse.json({ error: "User data corrupted (No password set)" }, { status: 500 });
    }

    // Compare
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log("❌ Password Mismatch");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    console.log("✅ Login Success");

    // Return user without the password
    const userResponse = user.toObject(); 
    delete userResponse.password;

    return NextResponse.json({ 
      message: "Login successful", 
      user: userResponse 
    }, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}