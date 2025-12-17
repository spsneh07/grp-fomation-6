import connectDB from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { projectMatchingFlow } from "@/ai/flows/ai-project-matching"; 

export const dynamic = 'force-dynamic'; // Prevent caching

export async function POST(request) {
  try {
    await connectDB();
    const { userId } = await request.json();

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    // 1. Fetch User and Projects
    const user = await User.findById(userId);
    const allProjects = await Project.find().lean(); 

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 2. Prepare Data for AI
    const aiInput = {
      userProfile: {
        name: user.name,
        bio: user.bio || "",
        skills: user.skills ? user.skills.map(s => s.name) : [],
        experienceLevel: user.experienceLevel || "Beginner",
      },
      availableProjects: allProjects.map(p => ({
        id: p._id.toString(),
        title: p.title,
        description: p.description,
        techStack: p.techStack || [],
        type: p.type || "General",
        teamSize: typeof p.teamSize === 'number' ? p.teamSize : 5
      }))
    };

    // 3. Run AI Flow
    console.log("🧠 Running AI Project Match...");
    const aiResponse = await projectMatchingFlow(aiInput);

    // 4. Merge AI Results back into Project Objects
    const scoredProjects = aiResponse.recommendations.map(rec => {
      const original = allProjects.find(p => p._id.toString() === rec.projectId);
      if (!original) return null;
      
      return {
        ...original,
        matchScore: rec.matchScore,
        aiReasoning: rec.reasoning,
        expertOrLearner: rec.expertOrLearner // Now included!
      };
    }).filter(Boolean);

    // Sort by highest score
    scoredProjects.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ projects: scoredProjects }, { status: 200 });

  } catch (error) {
    console.error("AI Flow Error:", error);
    return NextResponse.json({ error: "AI Processing Failed" }, { status: 500 });
  }
}