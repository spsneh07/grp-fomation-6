import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    // 1. Find user by email
    const user = await User.findOne({ email });
    
    // 2. Check if user exists AND password matches
    // (Note: In a real app, use bcrypt.compare(password, user.password))
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 3. Login Successful!
    return NextResponse.json({ 
      message: "Login successful", 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    }, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Server error during login" }, { status: 500 });
  }
}