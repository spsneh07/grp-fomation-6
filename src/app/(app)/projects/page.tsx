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
import { motion } from "framer-motion";

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
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="h-6 w-6 text-primary" />
        </motion.div>
        <span className="text-lg font-medium">Loading Projects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
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
      </motion.div>

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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={project._id}
              >
                <ProjectCard project={project} isCreator />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
          </motion.div>
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                key={project._id}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border border-slate-200 dark:border-white/5 rounded-2xl bg-slate-50 dark:bg-black/20 gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">You haven&apos;t joined any external projects yet.</p>
            <Button variant="link" asChild className="text-primary h-auto p-0 hover:text-primary/80">
              <Link href="/search">Find Projects to Join</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function ProjectCard({ project, isCreator = false }: { project: any; isCreator?: boolean }) {
  // CLEANUP: Handle legacy descriptions that have metadata appended
  const cleanDescription = project.description?.split('---')[0].trim() || "No description provided.";

  // PARSE LEGACY DATA: If structured fields are missing, try to extract from description
  let type = project.type;
  let commitment = project.timeCommitment;

  if (!type && project.description?.includes('Type:')) {
    const match = project.description.match(/Type: (.*?)(\n|$|•)/);
    if (match) type = match[1].trim();
  }
  if (!commitment && project.description?.includes('Commitment:')) {
    const match = project.description.match(/Commitment: (.*?)(\n|$|•)/);
    if (match) commitment = match[1].trim();
  }

  return (
    <Card className="flex flex-col h-full border-slate-200 dark:border-white/5 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-md transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden relative shadow-sm dark:shadow-none">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1.5 flex-1">
            <CardTitle className="font-headline text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">{project.title}</CardTitle>
            <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              {type && <span className="flex items-center gap-1 bg-white/50 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5"><Sparkles className="h-3 w-3" /> {type}</span>}
              {commitment && <span className="flex items-center gap-1 opacity-70">| {commitment}</span>}
            </div>
          </div>
          <Badge variant={project.status === "Closed" ? "secondary" : "outline"} className={`shrink-0 border-slate-200 dark:border-white/10 ${project.status === 'Open' ? 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20' : 'bg-slate-100 dark:bg-white/5'}`}>
            {project.status || "Active"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-4 relative z-10">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed min-h-[60px]">
          {cleanDescription}
        </p>

        <div className="flex flex-wrap gap-2">
          {project.techStack?.slice(0, 3).map((tech: string) => (
            <Badge key={tech} variant="secondary" className="text-[10px] px-2 py-0.5 h-6 bg-primary/10 text-primary border border-primary/10 hover:bg-primary/20 transition-colors">
              {tech}
            </Badge>
          ))}
          {project.techStack?.length > 3 && (
            <Badge variant="outline" className="text-[10px] h-6 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-muted-foreground">+{project.techStack.length - 3}</Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5">
          <div className="flex items-center text-xs text-muted-foreground font-medium">
            <Users className="mr-2 h-3.5 w-3.5" />
            <span className="">{project.team ? project.team.length + 1 : 1} / {project.teamSize || project.description?.match(/Team Size Goal: (\d+)/)?.[1] || 1} Members</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 relative z-10">
        <Button asChild variant={isCreator ? "default" : "secondary"} className={`w-full ${isCreator ? 'bg-primary hover:bg-primary/90 shadow-[0_0_15px_-5px_var(--primary)]' : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white border border-slate-200 dark:border-white/10'} transition-all`}>
          <Link href={`/projects/${project._id}/collaborate`}>
            {isCreator ? "Manage Workspace" : "Open Workspace"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}