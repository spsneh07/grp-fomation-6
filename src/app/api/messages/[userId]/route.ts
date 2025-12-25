import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DirectMessage from "@/models/DirectMessage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const { userId: otherUserId } = await params;

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const currentUserId = session.user.id || session.user._id;

        if (!otherUserId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // ✅ OPTIMIZED: Fetch only last 100 messages to speed up load
        // Use .lean() for faster object serialization
        const messages = await DirectMessage.find({
            $or: [
                { sender: currentUserId, recipient: otherUserId },
                { sender: otherUserId, recipient: currentUserId }
            ]
        })
        .sort({ createdAt: 1 }) // Oldest first (standard chat view)
        // If your chat view starts at the bottom, you might need to sort -1, limit, then reverse in frontend
        // But for now, if history is huge, sorting 1 and taking all is slow.
        // Better strategy for huge chats: Sort -1, limit 50, then reverse array.
        // For simplicity preserving your order:
        // .limit(100) -> This might grab the *oldest* 100 if sorted by 1. 
        // Correct approach for "Recent 100":
        .sort({ createdAt: -1 }) 
        .limit(100)
        .lean(); 

        // Reverse back to chronological order for UI
        return NextResponse.json({ messages: messages.reverse() });

    } catch (error) {
        console.error("Fetch Chat History Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}