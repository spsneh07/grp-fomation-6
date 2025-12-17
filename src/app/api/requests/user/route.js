import connectDB from "@/lib/db";
import Request from "@/models/Request";
import Project from "@/models/Project"; // Required to populate project details
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Find all requests where the 'applicant' is the current user
    const requests = await Request.find({ applicant: userId })
      .populate("project", "title techStack") // Get project title
      .populate("owner", "name") // Get owner name
      .sort({ createdAt: -1 }); // Newest first

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}