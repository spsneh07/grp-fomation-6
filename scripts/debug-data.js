const mongoose = require('mongoose');

// Check if .env.local exists and load it? 
// Since we are running with node, we might need dotenv.
// But we will pass the URI directly from the tool for simplicity if possible, or try to read it.
// Actually, I'll just hardcode the logic to connect if I can find the URI.
// Assuming the user has it in .env.local

require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("No MONGODB_URI found in .env.local");
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    clerkId: String,
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const ProjectSchema = new mongoose.Schema({
    title: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

async function checkData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const projects = await Project.find().populate('owner', 'name email').limit(5);
        console.log(`Found ${projects.length} projects`);

        projects.forEach(p => {
            console.log("Project:", p.title);
            console.log("Owner field:", p.owner);
            if (p.owner && p.owner._id) {
                console.log("Owner Name:", p.owner.name);
            } else {
                console.log("Owner is null or not populated");
            }
            console.log("-------------------");
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
