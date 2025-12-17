"use client";

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Book, Users, MessageSquare, ClipboardList, Loader2, Award } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function CollaboratePage() {
  const params = useParams(); // Get ID from URL
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 1. Fetch Project & User Data
  useEffect(() => {
    // Get current user from local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

 const fetchProject = async () => {
      if (!params?.id) return; // 🛑 STOP if no ID exists yet

      try {
        const res = await fetch(`/api/projects/${params.id}`);
        
        // ✅ Check if the response is actually JSON before parsing
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           throw new Error("Received HTML instead of JSON (Likely 404)");
        }

        const data = await res.json();
        if (data.project) {
            setProject(data.project);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

fetchProject();
  }, [params.id]);
  
  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!project) return <div className="p-10 text-center">Project not found</div>;

  // 2. Prepare Team Data
  // In a real app, you would have a 'team' array in DB. 
  // For now, we display the Owner as the first team member.
  const teamList = project.team && project.team.length > 0 
    ? project.team 
    : [{ user: project.owner, role: 'Owner' }]; // Fallback if team array is empty

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Collaboration: {project.title}</h1>
        <p className="text-muted-foreground">Your team's dedicated workspace.</p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* LEFT COLUMN: Chat & Board */}
        <div className="lg:col-span-2">
           <Tabs defaultValue="chat" className="w-full">
            <TabsList>
                <TabsTrigger value="chat"><MessageSquare className="w-4 h-4 mr-2"/>Team Chat</TabsTrigger>
                <TabsTrigger value="board"><ClipboardList className="w-4 h-4 mr-2"/>Project Board</TabsTrigger>
            </TabsList>
            
            {/* Chat Tab */}
            <TabsContent value="chat">
                 <Card className="h-[600px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline">Team Chat</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-hidden">
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-4">
                                {/* Simulated Welcome Message */}
                                <div className="flex items-start gap-3 justify-center my-4">
                                    <Badge variant="outline" className="text-muted-foreground">
                                        Today
                                    </Badge>
                                </div>
                                
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>AI</AvatarFallback>
                                    </Avatar>
                                    <div className="rounded-lg bg-muted p-3 max-w-[75%]">
                                        <p className="text-sm font-semibold">SynergyHub Bot</p>
                                        <p className="text-sm">Welcome to the workspace for <strong>{project.title}</strong>! Connect with your team here.</p>
                                    </div>
                                </div>

                                {currentUser && (
                                     <div className="flex items-start gap-3 justify-end">
                                     <div className="rounded-lg bg-primary text-primary-foreground p-3 max-w-[75%]">
                                             <p className="text-sm">I've joined the workspace! Ready to work.</p>
                                     </div>
                                     <Avatar className="h-8 w-8">
                                         <AvatarFallback>{currentUser.name?.charAt(0)}</AvatarFallback>
                                     </Avatar>
                                 </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="pt-4 border-t">
                        <div className="flex w-full items-center space-x-2">
                            <Input placeholder="Type a message..." />
                            <Button><Send className="h-4 w-4" /></Button>
                        </div>
                    </CardFooter>
                </Card>
            </TabsContent>
            
            {/* Board Tab */}
            <TabsContent value="board">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Project Requirements Board</CardTitle>
                        <CardDescription>An editable board for your team to align on project goals.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Project Description</h3>
                                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md mt-1">{project.description}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Tech Stack</h3>
                                <div className="flex gap-2 mt-2">
                                    {project.techStack.map((tech: string, i: number) => (
                                        <Badge key={i} variant="secondary">{tech}</Badge>
                                    ))}
                                </div>
                            </div>
                            {project.githubLink && (
                                <div>
                                    <h3 className="font-semibold">Repository</h3>
                                    <a href={project.githubLink} target="_blank" className="text-sm text-blue-500 hover:underline">{project.githubLink}</a>
                                </div>
                            )}
                       </div>
                    </CardContent>
                </Card>
            </TabsContent>
           </Tabs>
        </div>

        {/* RIGHT COLUMN: Team Members */}
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Users className="w-5 h-5"/> Team Members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {teamList.map((member: any, index: number) => {
                        const userData = member.user || member; // Handle population structure
                        return (
                            <div key={index} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted transition-colors">
                                <Avatar>
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`} />
                                    <AvatarFallback>{userData.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <p className="font-semibold">{userData.name}</p>
                                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                                </div>
                                {index === 0 ? 
                                    <Badge variant="default">Owner</Badge> : 
                                    <Badge variant="secondary">Member</Badge>
                                }
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}