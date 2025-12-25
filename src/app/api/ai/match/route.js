import connectDB from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request) {
  console.log('🚨 MATCH API CALLED - RETURNING MOCK');

  try {
    await connectDB();
    const { userId } = await request.json();

    // Just return projects without AI
    const allProjects = await Project.find({
      owner: { $ne: userId },
      'team.user': { $ne: userId }
    }).populate('owner', 'name avatarUrl').lean();

    console.log('✅ MATCH API: Returning', allProjects.length, 'projects (no AI)');
    return NextResponse.json({ projects: allProjects, mock: true }, { status: 200 });

  } catch (error) {
    console.error("❌ MATCH API Error:", error);
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}