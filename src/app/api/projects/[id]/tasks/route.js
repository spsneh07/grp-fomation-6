import connectDB from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    
    // ✅ OPTIMIZED: Use .lean() for faster JSON serialization
    const tasks = await Task.find({ project: id })
        .populate("assignedTo", "name email") 
        .sort({ createdAt: -1 })
        .lean();
        
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST, PUT, DELETE remain same...
export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { title, status, priority, description, assignedTo, dueDate, color, createdBy } = await req.json();

    const newTask = await Task.create({
      project: id,
      title,
      description: description || "",
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      color: color || "blue",
      assignedTo: assignedTo || null,
      createdBy
    });
    
    await newTask.populate("assignedTo", "name email");

    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
    try {
        await connectDB();
        const { taskId, ...updates } = await req.json();
        
        if (updates.assignedTo === "unassigned") {
            updates.assignedTo = null;
        }

        const updatedTask = await Task.findByIdAndUpdate(
            taskId, 
            { $set: updates }, 
            { new: true }
        ).populate("assignedTo", "name email");
        
        return NextResponse.json({ task: updatedTask }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { taskId } = await req.json();

        if (!taskId) return NextResponse.json({ error: "Task ID required" }, { status: 400 });

        await Task.findByIdAndDelete(taskId);
        
        return NextResponse.json({ message: "Task deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
}