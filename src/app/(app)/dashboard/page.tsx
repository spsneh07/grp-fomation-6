"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link as LinkIcon, AlertTriangle, User, Award, Book, Sparkles, Loader2, BrainCircuit, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { demoUser } from '@/lib/data'; // Removed mockJoinRequests
import Link from 'next/link';

// Component for Empty State
const NoMatchSuggestions = () => {
    return (
        <Card className="border-dashed">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Sparkles className="text-primary w-5 h-5"/>
                    No Projects Found
                </CardTitle>
                <CardDescription>
                    Be the first to post a project or wait for others to join!
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
                <Button asChild>
                    <Link href="/projects/new">Create a Project</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
  const router = useRouter();
  
  const [user, setUser] = useState(demoUser);
  const [projects, setProjects] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]); // ✅ New State for Real Requests
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check LocalStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    const currentUserId = parsedUser.id || parsedUser._id;
    
    setUser({ ...demoUser, ...parsedUser });

    // 2. Fetch Latest Profile
    const fetchLatestProfile = async () => {
        try {
            const res = await fetch("/api/users/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId }),
            });
            const data = await res.json();
            
            if (data.user) {
                setUser(prev => ({ ...prev, ...data.user }));
                localStorage.setItem("user", JSON.stringify(data.user));
            }
        } catch (error) {
            console.error("Failed to sync profile", error);
        }
    };

    // 3. Fetch AI Matches
    const fetchAIProjects = async () => {
        try {
            const res = await fetch("/api/ai/match", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId }),
            });
            
            const data = await res.json();
            if (data.projects) {
                setProjects(data.projects);
            }
        } catch (error) {
            console.error("Failed to load AI projects", error);
        }
    };

    // 4. ✅ NEW: Fetch My Sent Requests
    const fetchMyRequests = async () => {
        try {
            const res = await fetch("/api/requests/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId }),
            });
            const data = await res.json();
            if (data.requests) {
                setMyRequests(data.requests);
            }
        } catch (error) {
            console.error("Failed to load requests", error);
        }
    };

    if (currentUserId) {
        Promise.all([
            fetchLatestProfile(), 
            fetchAIProjects(),
            fetchMyRequests()
        ]).finally(() => setLoading(false));
    }
  }, [router]);

  // Helper to colorize status
  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
        case 'accepted': return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1"/> Accepted</Badge>;
        case 'rejected': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
        default: return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center gap-2"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="text-lg font-medium">Consulting AI...</span></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Welcome, {user.name}!</h1>
        <p className="text-muted-foreground">Here are projects recommended for you based on your skills.</p>
      </div>

      <Tabs defaultValue="projects">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 sm:w-auto">
          <TabsTrigger value="projects" className="gap-2"><BrainCircuit className="h-4 w-4" /> AI Matched Projects</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="requests">My Applications</TabsTrigger>
        </TabsList>
        
        {/* === AI PROJECTS TAB === */}
        <TabsContent value="projects" className="space-y-6 mt-6">
            {projects.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project, index) => (
                    <Card key={project._id || index} className="flex flex-col hover:shadow-md transition-all border-l-4 border-l-primary/50">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="font-headline line-clamp-1">{project.title}</CardTitle>
                                    <CardDescription className="line-clamp-1">
                                        by {project.owner?.name || "Unknown"}
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant={project.matchScore > 80 ? "default" : "secondary"}>
                                        {project.matchScore}% Match
                                    </Badge>
                                    {project.expertOrLearner && (
                                        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                                            {project.expertOrLearner}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <div className="space-y-1">
                                <Progress value={project.matchScore} className="h-2" />
                            </div>

                            {project.aiReasoning && (
                                <div className="bg-muted/50 p-2 rounded-md text-xs italic text-muted-foreground border border-muted">
                                    <span className="font-semibold not-italic text-primary">AI says:</span> " {project.aiReasoning} "
                                </div>
                            )}

                            <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                            
                            <div>
                                <div className="flex flex-wrap gap-1">
                                    {project.techStack?.slice(0, 3).map((tech: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                            {tech}
                                        </Badge>
                                    ))}
                                    {project.techStack?.length > 3 && (
                                        <Badge variant="outline" className="text-xs">+{project.techStack.length - 3}</Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4 border-t bg-secondary/10">
                            <Button className="w-full" asChild>
                                <Link href={`/projects/${project._id || '0'}/collaborate`}>
                                    View & Join
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                    ))}
                </div>
            ) : <NoMatchSuggestions />}
        </TabsContent>

        {/* === PROFILE TAB === */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline flex items-center gap-2"><User className="h-5 w-5"/> Your Profile</CardTitle>
                    <CardDescription>This is how others see you on the platform.</CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/settings">Edit Profile</Link>
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user.avatarUrl} alt={user.name}/>
                        <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-xl font-bold">{user.name}</h3>
                        <p className="text-muted-foreground">{user.experienceLevel || "Beginner"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                </div>
                <p className="text-muted-foreground">{user.bio || "No bio added yet."}</p>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Award className="h-5 w-5"/> Your Skills</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="grid gap-4 md:grid-cols-2">
                    {user.skills && user.skills.length > 0 ? (
                        user.skills.map((skill: any, index: number) => (
                            <div key={index} className="p-4 border rounded-lg space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold">{skill.name}</h4>
                                        <p className="text-sm text-muted-foreground">{skill.level}</p>
                                    </div>
                                     <Badge variant="secondary">
                                        <Book className="mr-1 h-3 w-3" /> {skill.mode || "Learner"}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-sm">No skills added yet. Go to Settings to add some.</p>
                    )}
                 </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === REQUESTS TAB (Fixed) === */}
        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Send className="h-5 w-5"/> Sent Applications
              </CardTitle>
              <CardDescription>Projects you have applied to join.</CardDescription>
            </CardHeader>
            <CardContent>
              {myRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Date Applied</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myRequests.map((req) => (
                          <TableRow key={req._id}>
                            <TableCell className="font-medium">
                                <Link href={`/projects/${req.project?._id || '#'}`} className="hover:underline">
                                    {req.project?.title || "Unknown Project"}
                                </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {new Date(req.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                {getStatusBadge(req.status)}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/projects/${req.project?._id || '#'}/collaborate`}>
                                        View
                                    </Link>
                                </Button>
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              ) : (
                  <div className="text-center py-8 text-muted-foreground">
                      <p>You haven't sent any join requests yet.</p>
                      <Button variant="link" onClick={() => document.querySelector('[value="projects"]')?.dispatchEvent(new MouseEvent('click', {bubbles: true}))}>
                          Browse Matched Projects
                      </Button>
                  </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}