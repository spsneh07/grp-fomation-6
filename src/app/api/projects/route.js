import { connectToDatabase } from "@/lib/mongoose";
import Project from "@/models/Project";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    // ✅ Get the owner ID from the request body
    const { title, description, techStack, githubLink, owner, type, timeCommitment, teamSize } = await request.json();

    const newProject = await Project.create({
      title,
      description,
      techStack,
      githubLink,
      owner,
      type,
      timeCommitment,
      teamSize
    });

    return NextResponse.json({
      message: "Project Created Successfully!",
      project: newProject
    }, { status: 201 });

  } catch (error) {
    console.error("Project Creation Error:", error);
    return NextResponse.json({
      error: "Failed to create project",
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    // ✅ .populate('owner') fetches the User's name along with the project!
    const projects = await Project.find().sort({ createdAt: -1 }).populate('owner', 'name email avatarUrl');

    // DEBUG LOG
    console.log(`Fetched ${projects.length} projects.`);
    if (projects.length > 0) {
      console.log("Sample project owner:", projects[0].owner);
      console.log("Sample project data:", JSON.stringify(projects[0], null, 2));
    }

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error("Fetch Projects Error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}