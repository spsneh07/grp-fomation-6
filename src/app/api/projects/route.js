import connectDB from "@/lib/db";
import Project from "@/models/Project";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    
    // ✅ Get the owner ID from the request body
    const { title, description, techStack, githubLink, owner } = await request.json();

    const newProject = await Project.create({
      title,
      description,
      techStack,
      githubLink,
      owner, // Save the ID of the user who created it
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
    await connectDB();
    // ✅ .populate('owner') fetches the User's name along with the project!
    const projects = await Project.find().sort({ createdAt: -1 }).populate('owner', 'name email');

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}