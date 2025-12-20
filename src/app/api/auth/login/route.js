// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // Import JWT

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    // 1. Find User
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    // 3. Create Token Payload
    const tokenData = {
      id: user._id,
      email: user.email,
    };

    // 4. Generate JWT Token
    // Make sure TOKEN_SECRET is in your .env file
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, {
      expiresIn: "1d",
    });

    // 5. Create the Response
    const response = NextResponse.json({
      message: "Login successful",
      success: true,
      user: {
        id: user._id,
        email: user.email,
        hasCompletedOnboarding: user.hasCompletedOnboarding, // ✅ The Flag for Redirect
      },
    });

    // 6. Set the Token as an HTTP-Only Cookie
    response.cookies.set("token", token, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}