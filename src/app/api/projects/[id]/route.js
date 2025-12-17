import connectDB from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User"; // Ensure User is registered
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectDB();

    // 1. ✅ FIX: Await params (Required in Next.js 15)
    const { id } = await params;

    // 2. ✅ FIX: Check if ID is a valid MongoDB ID
    // If the ID is "proj-1" (mock data), this will safely return 404 instead of crashing
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Project ID" }, { status: 404 });
    }

    // 3. Fetch the real project
    const project = await Project.findById(id)
      .populate('owner', 'name email')
      .populate('team.user', 'name email experienceLevel bio');

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project }, { status: 200 });

  } catch (error) {
    console.error("Fetch Project Error:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}