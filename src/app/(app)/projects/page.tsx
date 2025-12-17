"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, PlusCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MyProjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [createdProjects, setCreatedProjects] = useState<any[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<any[]>([]);

  useEffect(() => {
    // 1. Get Logged In User
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(storedUser);
    const currentUserId = user.id || user._id; // Get ID safely

    // 2. Fetch All Projects
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        
        if (data.projects) {
          const allProjects = data.projects;

          console.log("🔍 Debugging IDs:");
          console.log("My User ID:", currentUserId);

          // ✅ ROBUST FILTER: Created by Me
          const myCreated = allProjects.filter((p: any) => {
            // Handle if owner is populated (object) or raw (string)
            const ownerId = p.owner?._id || p.owner; 
            
            // Convert both to String to ensure they match (e.g. "123" vs 123)
            const isMatch = String(ownerId) === String(currentUserId);
            
            if (isMatch) console.log("✅ Found Project:", p.title);
            return isMatch;
          });
          setCreatedProjects(myCreated);

          // ✅ ROBUST FILTER: Joined Projects
          const myJoined = allProjects.filter((p: any) => 
            p.team && p.team.some((member: any) => {
               const memberId = member.user?._id || member.user;
               const ownerId = p.owner?._id || p.owner;
               
               // Must be IN the team, but NOT the owner
               return String(memberId) === String(currentUserId) && 
                      String(ownerId) !== String(currentUserId);
            })
          );
          setJoinedProjects(myJoined);
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">
            All projects you have created or joined.
          </p>
        </div>
        <Button asChild>
          {/* ✅ Correct Link */}
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Project
          </Link>
        </Button>
      </div>

      <section>
        <h2 className="font-headline text-2xl font-semibold mb-4">
          Created by Me
        </h2>
        {createdProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {createdProjects.map((project) => (
              <ProjectCard key={project._id} project={project} isCreator />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">You haven&apos;t created any projects yet.</p>
            <Button variant="outline" asChild>
                <Link href="/projects/new">Create Your First Project</Link>
            </Button>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-headline text-2xl font-semibold mb-4">
          Joined Projects
        </h2>
        {joinedProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {joinedProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">You haven&apos;t joined any projects yet.</p>
        )}
      </section>
    </div>
  );
}

function ProjectCard({ project, isCreator = false }: { project: any; isCreator?: boolean }) {
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline line-clamp-1">{project.title}</CardTitle>
        <CardDescription>
            {project.techStack && project.techStack.length > 0 
                ? project.techStack.slice(0, 3).join(", ") 
                : "No tech stack listed"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>
        <div className="mt-4 flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          {/* Default to 1 member (owner) if team is empty */}
          <span>{project.team ? project.team.length + 1 : 1} Members</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Badge variant={project.status === "Closed" ? "secondary" : "default"}>
          {project.status || "Active"}
        </Badge>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/projects/${project._id}/collaborate`}>
            {isCreator ? "Manage Workspace" : "Open Workspace"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}