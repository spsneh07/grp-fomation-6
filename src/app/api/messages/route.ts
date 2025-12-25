import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DirectMessage from "@/models/DirectMessage";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const userId = new mongoose.Types.ObjectId(session.user.id || session.user._id);

        // ✅ OPTIMIZED: Use Aggregation to get only the last message per conversation
        const conversations = await DirectMessage.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { recipient: userId }]
                }
            },
            {
                $sort: { createdAt: -1 } // Sort by newest first
            },
            {
                $group: {
                    _id: {
                        $cond: { if: { $eq: ["$sender", userId] }, then: "$recipient", else: "$sender" }
                    },
                    lastMessageDoc: { $first: "$$ROOT" } // Keep only the latest message
                }
            },
            {
                $lookup: {
                    from: "users", // Assumes your collection name is 'users'
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    _id: "$userDetails._id",
                    name: "$userDetails.name",
                    email: "$userDetails.email",
                    image: "$userDetails.image",
                    jobTitle: "$userDetails.jobTitle",
                    lastMessage: "$lastMessageDoc.content",
                    lastMessageTime: "$lastMessageDoc.createdAt",
                    // If I sent it, it's read. If I received it, check isRead status.
                    isRead: {
                        $cond: { 
                            if: { $eq: ["$lastMessageDoc.sender", userId] }, 
                            then: true, 
                            else: "$lastMessageDoc.isRead" 
                        }
                    }
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            }
        ]);

        return NextResponse.json({ conversations });

    } catch (error) {
        console.error("Fetch Conversations Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// POST remains the same...
export async function POST(req: Request) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id || session.user._id;
        const { recipientId, content } = await req.json();

        if (!recipientId || !content) {
            return NextResponse.json({ error: "Recipient ID and Content are required" }, { status: 400 });
        }

        const newMessage = await DirectMessage.create({
            sender: userId,
            recipient: recipientId,
            content,
            isRead: false
        });

        return NextResponse.json({ message: "Message sent", data: newMessage });

    } catch (error) {
        console.error("Send Message Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}