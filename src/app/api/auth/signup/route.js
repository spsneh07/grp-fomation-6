import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // 1. Connect to the database
    await connectDB();
    
    // 2. Get the data the user typed
    const { name, email, password, experienceLevel, bio, skills } = await request.json();

    // 3. Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    // 4. Save the new user to MongoDB
    const newUser = await User.create({
      name,
      email,
      password, // Note: For a real app, you should hash this password!
      experienceLevel,
      bio,
      skills
    });

    // 5. Send success message back to the frontend
    return NextResponse.json({ message: "User created successfully", user: newUser }, { status: 201 });

  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: "Signup failed", details: error.message }, { status: 500 });
  }
}