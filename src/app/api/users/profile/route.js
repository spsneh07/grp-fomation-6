import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// ✅ POST: Get User Profile (Used when page loads)
export async function POST(request) {
  try {
    await connectDB();
    const { userId } = await request.json();

    if (!userId) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// ✅ PUT: Update User Profile (Used when you click Save)
export async function PUT(request) {
  try {
    await connectDB();
    const { userId, name, bio, skills, experienceLevel, availability } = await request.json();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name, 
        bio, 
        skills, 
        experienceLevel,
        availability
      },
      { new: true } // Return the updated document
    );

    return NextResponse.json({ user: updatedUser, message: "Profile updated!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}