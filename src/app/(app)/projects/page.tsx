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
import { Users, PlusCircle, Loader2, FolderKanban, Sparkles, FolderOpen, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProjectCard } from "@/components/project-card";
// import { motion } from "framer-motion";

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

          // ✅ ROBUST FILTER: Created by Me
          const myCreated = allProjects.filter((p: any) => {
            const ownerId = p.owner?._id || p.owner;
            return String(ownerId) === String(currentUserId);
          });
          setCreatedProjects(myCreated);

          // ✅ ROBUST FILTER: Joined Projects
          const myJoined = allProjects.filter((p: any) =>
            p.team && p.team.some((member: any) => {
              const memberId = member.user?._id || member.user;
              const ownerId = p.owner?._id || p.owner;
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
    return (
      <div className="flex h-screen items-center justify-center gap-2 text-muted-foreground">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
        <span className="text-lg font-medium">Loading Projects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-200 dark:border-white/5 pb-8"
      >
        <div>
          <h1 className="font-headline text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/60">My Projects</h1>
          <p className="text-muted-foreground text-lg mt-2 font-light">
            Manage your innovations and collaborations.
          </p>
        </div>
        <Button asChild className="h-11 px-6 bg-primary hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--primary)] transition-all hover:scale-105 group">
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
            Create New Project
          </Link>
        </Button>
      </div>

      {/* Created Projects */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </div>
          <h2 className="font-headline text-2xl font-semibold">Created by Me</h2>
        </div>

        {createdProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {createdProjects.map((project, index) => (
              <div
                key={project._id}
              >
                <ProjectCard project={project} isCreator />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors gap-4 text-center group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <div className="relative z-10">
              <h3 className="font-semibold text-xl mb-1">No projects created yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">Start your journey by creating your first AI-powered project workspace.</p>
            </div>
            <Button variant="outline" asChild className="mt-4 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 relative z-10">
              <Link href="/projects/new">Create Project</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Joined Projects */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <h2 className="font-headline text-2xl font-semibold">Joined Projects</h2>
        </div>

        {joinedProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {joinedProjects.map((project, index) => (
              <div
                key={project._id}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border border-slate-200 dark:border-white/5 rounded-2xl bg-slate-50 dark:bg-black/20 gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">You haven&apos;t joined any external projects yet.</p>
            <Button variant="link" asChild className="text-primary h-auto p-0 hover:text-primary/80">
              <Link href="/search?type=projects">Find Projects to Join</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

