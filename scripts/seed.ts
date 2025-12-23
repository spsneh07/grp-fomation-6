
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Import Models
// Note: Using relative paths to source files. 
// Ideally these would be imported from a barrel file or using path aliases if configured.
// We import .js files because the source models are in JS.
import User from "../src/models/User.js";
import Project from "../src/models/Project.js";
import Task from "../src/models/Task.js";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in .env.local");
    process.exit(1);
}

const sampleUsers = [
    {
        name: "Alice Engineering",
        email: "alice@example.com",
        jobTitle: "Senior Frontend Engineer",
        bio: "Passionate about UI/UX and React ecosystem.",
        skills: ["React", "TypeScript", "TailwindCSS", "Next.js"],
        preferences: { projectInvites: true, newMatches: true },
        isActive: true,
    },
    {
        name: "Bob Backend",
        email: "bob@example.com",
        jobTitle: "Backend Developer",
        bio: "Scalable systems enthusiast. Python and Go lover.",
        skills: ["Node.js", "Python", "Go", "MongoDB", "SQL"],
        preferences: { projectInvites: true, newMatches: true },
        isActive: true,
    },
    {
        name: "Charlie Designer",
        email: "charlie@example.com",
        jobTitle: "Product Designer",
        bio: "Designing clean and accessible web interfaces.",
        skills: ["Figma", "UI/UX", "CSS", "Design Systems"],
        preferences: { projectInvites: true, newMatches: false },
        isActive: true,
    },
    {
        name: "Diana Data",
        email: "diana@example.com",
        jobTitle: "Data Scientist",
        bio: "Turning data into insights. AI/ML practitioner.",
        skills: ["Python", "TensorFlow", "Pandas", "Scikit-learn"],
        preferences: { projectInvites: true, newMatches: true },
        isActive: true,
    },
    {
        name: "Evan Manager",
        email: "evan@example.com",
        jobTitle: "Product Manager",
        bio: "Driving product vision and execution.",
        skills: ["Agile", "Product Management", "Jira", "Strategy"],
        preferences: { projectInvites: true, newMatches: true },
        isActive: true,
    },
];

const sampleProjects = [
    {
        title: "EcoTrack - Sustainable Living App",
        description: "A mobile application to help users track their carbon footprint and suggest daily changes for a more sustainable lifestyle.",
        type: "Startup",
        timeCommitment: "Part-time",
        teamSize: 3,
        techStack: ["React Native", "Firebase", "Node.js"],
        ownerEmail: "alice@example.com", // Will map to ID
        teamEmails: ["charlie@example.com"],
    },
    {
        title: "AlgoViz - Algorithm Visualizer",
        description: "Web-based platform for visualizing complex algorithms and data structures for educational purposes.",
        type: "Personal",
        timeCommitment: "Flexible",
        teamSize: 2,
        techStack: ["React", "D3.js", "TypeScript"],
        ownerEmail: "bob@example.com",
        teamEmails: ["alice@example.com"],
    },
    {
        title: "MarketMinds - AI Stock Predictor",
        description: "Using machine learning specifically to analyze sentiment on social media affecting stock prices.",
        type: "Hackathon",
        timeCommitment: "Full-time",
        teamSize: 4,
        techStack: ["Python", "Flask", "React", "TensorFlow"],
        ownerEmail: "diana@example.com",
        teamEmails: ["bob@example.com", "evan@example.com"],
    },
];

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

const seed = async () => {
    await connectDB();

    console.log("🧹 Clearing existing data...");
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    console.log("🌱 Seeding Users...");
    const createdUsers = await User.insertMany(sampleUsers);
    const userMap = new Map(createdUsers.map(u => [u.email, u._id]));

    console.log(`✅ Created ${createdUsers.length} users`);

    console.log("🌱 Seeding Projects...");
    const projectDocs = sampleProjects.map(p => {
        const ownerId = userMap.get(p.ownerEmail);
        if (!ownerId) throw new Error(`Owner not found for ${p.title}`);

        const teamMembers = (p.teamEmails || []).map(email => ({
            user: userMap.get(email),
            role: "Member"
        })).filter(m => m.user); // content safety

        return {
            ...p,
            owner: ownerId,
            team: teamMembers
        };
    });

    const createdProjects = await Project.insertMany(projectDocs);
    console.log(`✅ Created ${createdProjects.length} projects`);

    console.log("🌱 Seeding Tasks...");
    const tasks = [];

    // Create some random tasks for projects
    for (const project of createdProjects) {
        tasks.push({
            project: project._id,
            title: "Initial Setup",
            description: "Set up the repository and basic project structure.",
            status: "done",
            priority: "high",
            color: "blue",
            createdBy: project.owner,
            assignedTo: project.owner
        });

        tasks.push({
            project: project._id,
            title: "Design Database Schema",
            description: "Define the data models for the core features.",
            status: "in-progress",
            priority: "high",
            color: "purple",
            createdBy: project.owner,
            assignedTo: project.owner
        });

        tasks.push({
            project: project._id,
            title: "Create Landing Page",
            description: "Design and implement the landing page.",
            status: "todo",
            priority: "medium",
            color: "green",
            createdBy: project.owner,
            assignedTo: null
        });
    }

    await Task.insertMany(tasks);
    console.log(`✅ Created ${tasks.length} tasks`);

    console.log("🏁 Seeding complete!");
    process.exit(0);
};

seed().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
