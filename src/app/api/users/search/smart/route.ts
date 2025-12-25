import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query) {
            return NextResponse.json({ users: [] });
        }

        await connectToDatabase();

        // TODO: Implement actual AI/Semantic search here.
        // For now, falling back to the same regex search as the basic endpoint to resolve the 404.
        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { "skills.name": { $regex: query, $options: "i" } },
                { jobTitle: { $regex: query, $options: "i" } },
                { bio: { $regex: query, $options: "i" } }
            ]
        })
            .select("name email image avatarUrl jobTitle skills bio")
            .limit(20);

        return NextResponse.json({ users });

    } catch (error) {
        console.error("Smart Search API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
