import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Project from "@/models/Project";
import User from "@/models/User"; // Ensure User model is registered

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        await connectToDatabase();

        let filter: any = {};
        if (query) {
            filter = {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                    { techStack: { $regex: query, $options: "i" } },
                    { type: { $regex: query, $options: "i" } }
                ]
            };
        }

        // Only return Open projects for search, or maybe all? defaulting to Open/Active usually better for "finding projects to join"
        // But let's return all for now to be safe, maybe just limit to not Closed?
        // filter.status = { $ne: 'Closed' }; 

        const projects = await Project.find(filter)
            .populate("owner", "name avatarUrl")
            .populate("team.user", "name avatarUrl")
            .sort({ createdAt: -1 })
            .limit(20);

        return NextResponse.json({ projects });

    } catch (error) {
        console.error("Project Search API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
