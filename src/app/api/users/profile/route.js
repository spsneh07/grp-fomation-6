import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// ✅ POST: Get User Profile
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

// ✅ PUT: Update User Profile
export async function PUT(request) {
  try {
    await connectDB();
    const { userId, name, bio, skills, experienceLevel, availability, jobTitle, socialLinks, avatarUrl } = await request.json();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        bio,
        skills, // Now accepts the array of objects because schema is updated
        experienceLevel,
        availability,
        jobTitle,
        socialLinks,
        avatarUrl
      },
      { new: true, runValidators: true } // runValidators ensures data matches schema
    );

    return NextResponse.json({ user: updatedUser, message: "Profile updated!" }, { status: 200 });
  } catch (error) {
    console.error("Profile Update Error:", error);
    // Return the actual error message to help debugging
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}