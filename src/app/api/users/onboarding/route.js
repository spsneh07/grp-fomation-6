import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function PUT(req) {
  try {
    await connectDB();
    const { email, jobTitle, bio } = await req.json();

    // Update the user
    // We update the profile fields AND set hasCompletedOnboarding to true
    const updatedUser = await User.findOneAndUpdate(
      { email }, 
      { 
        jobTitle, 
        bio, 
        hasCompletedOnboarding: true 
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
        success: true, 
        user: updatedUser 
    });

  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}