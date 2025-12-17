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
import { ExternalLink, Award, Book, Link as LinkIcon, AlertTriangle, User, Briefcase, Clock, Sparkles, Loader2 } from 'lucide-react';
import { demoUser, mockJoinRequests } from '@/lib/data';
import Link from 'next/link';

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
                    <Link href="/add-project">Create a Project</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
  const router = useRouter();
  
  const [user, setUser] = useState(demoUser);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Load User
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const realUser = JSON.parse(storedUser);
    setUser({ ...demoUser, ...realUser });

    // 2. Fetch REAL Projects from API
    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects"); // ✅ Fetch from Database
            const data = await res.json();
            if (data.projects) {
                setProjects(data.projects);
            }
        } catch (error) {
            console.error("Failed to load projects", error);
        } finally {
            setLoading(false);
        }
    };

    fetchProjects();
  }, [router]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Welcome, {user.name}!</h1>
        <p className="text-muted-foreground">Here&apos;s your personal mission control.</p>
      </div>

      <Tabs defaultValue="projects">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 sm:w-auto">
          <TabsTrigger value="projects">Community Projects</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>
        
        {/* ✅ REAL PROJECTS TAB */}
        <TabsContent value="projects" className="space-y-6 mt-6">
            {projects.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                    <Card key={project._id} className="flex flex-col hover:shadow-md transition-all">
                        <CardHeader>
                            <CardTitle className="font-headline line-clamp-1">{project.title}</CardTitle>
                            <CardDescription className="line-clamp-1">
                                by {project.owner?.name || "Unknown"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                            <div>
                                <div className="flex flex-wrap gap-1">
                                    {project.techStack?.slice(0, 3).map((tech: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
                                    ))}
                                    {project.techStack?.length > 3 && (
                                        <Badge variant="outline" className="text-xs">+{project.techStack.length - 3}</Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4 border-t bg-secondary/10">
                            {/* ✅ CORRECT LINK TO COLLABORATE PAGE */}
                            {/* Uses _id because that is what MongoDB uses */}
                            <Button className="w-full" asChild>
                                <Link href={`/projects/${project._id}/collaborate`}>
                                    View & Join
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                    ))}
                </div>
            ) : <NoMatchSuggestions />}
        </TabsContent>

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
                    {user.skills && user.skills.map((skill: any, index: number) => (
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
                            {skill.verification && skill.verification.type === 'Link' ? (
                                <a href={skill.verification.url} target="_blank" rel="noreferrer" className="text-sm text-purple-600 flex items-center gap-1 font-medium">
                                    <LinkIcon className="h-3 w-3"/> Verified
                                </a>
                            ) : (
                                <p className="text-sm text-amber-600 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3"/> Self-Declared
                                </p>
                            )}
                        </div>
                    ))}
                 </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">My Join Requests</CardTitle>
              <CardDescription>This is a demo section.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockJoinRequests.map(req => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">Demo Project {req.projectId}</TableCell>
                        <TableCell><Badge variant="outline">{req.status}</Badge></TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}