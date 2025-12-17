import connectDB from "@/lib/db"; // This imports the "default" export we made above
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ message: "✅ Success! Connected to MongoDB." });
  } catch (error) {
    console.error("Database Connection Error:", error);
    return NextResponse.json({ 
      error: "❌ Connection Failed", 
      details: error.message 
    }, { status: 500 });
  }
}