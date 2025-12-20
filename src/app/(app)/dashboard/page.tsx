"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"; // ✅ Imported signOut
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sparkles, Loader2, BrainCircuit, Send, Clock, CheckCircle, XCircle, Inbox, Check, X, LogOut } from 'lucide-react'; // ✅ Added LogOut icon
import { demoUser } from '@/lib/data'; 
import Link from 'next/link';
import { toast } from "sonner"; 

// ... NoMatchSuggestions Component (Keep as is) ...
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
  const { data: session } = useSession(); 
  
  const [user, setUser] = useState(demoUser);
  const [projects, setProjects] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]); 
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  // Helper
  const getShortDescription = (fullDesc: string) => {
    if (!fullDesc) return "No description provided.";
    const [mainText] = fullDesc.split('---'); 
    return mainText.trim();
  };

  // ✅ NEW: Handle Logout Logic
  const handleLogout = async () => {
    // 1. Clear Local Storage
    localStorage.removeItem("user");
    
    // 2. Clear Server-Side Cookie (Call API)
    await fetch("/api/auth/logout", { method: "POST" });

    // 3. Sign out of Google (NextAuth) & Redirect
    await signOut({ callbackUrl: "/login" });
  };

  useEffect(() => {
    let currentUserId: string | null = null;
    let currentUserData: any = null;

    // 1. Check Google Session
    if (session?.user) {
        currentUserData = {
            // @ts-ignore
            id: session.user.id || session.user._id,
            name: session.user.name,
            email: session.user.email,
            avatarUrl: session.user.image,
            // @ts-ignore
            experienceLevel: session.user.experienceLevel || "Beginner",
            // @ts-ignore
            hasCompletedOnboarding: session.user.hasCompletedOnboarding // Expect this from session
        };
    } 
    // 2. Check LocalStorage
    else {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            currentUserData = JSON.parse(storedUser);
        }
    }

    // ✅ CRITICAL SECURITY CHECK
    if (currentUserData) {
        // If they haven't finished setup, kick them to onboarding
        // We check explicit 'false', assuming undefined might be old users
        if (currentUserData.hasCompletedOnboarding === false) {
             router.push("/onboarding");
             return;
        }

        // Otherwise, load dashboard
        localStorage.setItem("user", JSON.stringify(currentUserData));
        setUser({ ...demoUser, ...currentUserData });
        currentUserId = currentUserData.id || currentUserData._id;
    } else if (session === null) {
         // No user found anywhere
         router.push("/login");
         return;
    }

    // Define Fetch Functions (Keep existing logic)
    const fetchAIProjects = async (id: string) => {
        try {
            const res = await fetch("/api/ai/match", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: id }),
            });
            const data = await res.json();
            if (data.projects) setProjects(data.projects);
        } catch (error) { console.error(error); }
    };

    const fetchMyRequests = async (id: string) => {
        try {
            const res = await fetch("/api/requests/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: id }),
            });
            const data = await res.json();
            if (data.requests) setMyRequests(data.requests);
        } catch (error) { console.error(error); }
    };

    const fetchIncomingRequests = async (id: string) => {
        try {
            const res = await fetch("/api/requests/owner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: id }),
            });
            const data = await res.json();
            if (data.requests) setIncomingRequests(data.requests);
        } catch (error) { console.error(error); }
    };

    // Execute Fetches
    if (currentUserId) {
        Promise.all([
            fetchAIProjects(currentUserId),
            fetchMyRequests(currentUserId),
            fetchIncomingRequests(currentUserId) 
        ]).finally(() => setLoading(false));
    }
  }, [router, session]);

  // Handle Accept / Reject Action (Keep existing logic)
  const handleRequestAction = async (requestId: string, status: 'accepted' | 'rejected') => {
      try {
          const res = await fetch("/api/requests", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ requestId, status }),
          });
          
          if (res.ok) {
              setIncomingRequests(prev => prev.filter(r => r._id !== requestId));
              toast.success(`Request ${status}`);
          } else {
             toast.error("Failed to update request");
          }
      } catch (error) {
          console.error("Action failed", error);
          toast.error("Connection error");
      }
  };

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
        case 'accepted': return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1"/> Accepted</Badge>;
        case 'rejected': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
        default: return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center gap-2"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="text-lg font-medium">Loading Dashboard...</span></div>;

  return (
    <div className="space-y-8">
      {/* ✅ HEADER WITH LOGOUT BUTTON */}
      <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold">Welcome, {user.name}!</h1>
            <p className="text-muted-foreground">Manage your projects and applications.</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
      </div>

      <Tabs defaultValue="projects">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 sm:w-auto">
          <TabsTrigger value="projects" className="gap-2"><BrainCircuit className="h-4 w-4" /> Recommended</TabsTrigger>
          <TabsTrigger value="requests" className="gap-2"><Send className="h-4 w-4"/> Applications</TabsTrigger>
          <TabsTrigger value="inbox" className="gap-2">
            <Inbox className="h-4 w-4"/> Inbox 
            {incomingRequests.length > 0 && <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">{incomingRequests.length}</Badge>}
          </TabsTrigger>
        </TabsList>
        
        {/* ... (Rest of your TabsContent remains exactly the same) ... */}
        
        {/* === AI PROJECTS TAB === */}
        <TabsContent value="projects" className="space-y-6 mt-6">
            {projects.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project, index) => (
                          <Card key={project._id || index} className="flex flex-col border-l-4 border-l-primary/50 hover:shadow-md transition-shadow">
                             <CardHeader>
                                <CardTitle className="font-headline line-clamp-1">{project.title}</CardTitle>
                                <CardDescription>by {project.owner?.name}</CardDescription>
                             </CardHeader>
                             
                             <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 min-h-[60px]">
                                    {getShortDescription(project.description)}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {project.techStack?.slice(0,3).map((t:any, i:number)=><Badge key={i} variant="secondary" className="text-xs">{t}</Badge>)}
                                    {(project.techStack?.length || 0) > 3 && <Badge variant="outline" className="text-xs">+{project.techStack.length - 3}</Badge>}
                                </div>
                             </CardContent>

                             <CardFooter>
                                <Button className="w-full" asChild><Link href={`/projects/${project._id}/collaborate`}>View Project</Link></Button>
                             </CardFooter>
                          </Card>
                    ))}
                </div>
            ) : <NoMatchSuggestions />}
        </TabsContent>

        {/* === OUTGOING REQUESTS TAB === */}
        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Send className="h-5 w-5"/> Sent Applications</CardTitle>
            </CardHeader>
            <CardContent>
               <Table>
                 <TableBody>
                   {myRequests.map((req) => (
                     <TableRow key={req._id}>
                        <TableCell>{req.project?.title}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === INCOMING REQUESTS TAB === */}
        <TabsContent value="inbox" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Inbox className="h-5 w-5"/> Incoming Requests
              </CardTitle>
              <CardDescription>People waiting to join your projects.</CardDescription>
            </CardHeader>
            <CardContent>
              {incomingRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomingRequests.map((req) => (
                          <TableRow key={req._id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {req.applicant?.name?.charAt(0) || "U"}
                                    </div>
                                    {req.applicant?.name || "Unknown User"}
                                </div>
                            </TableCell>
                            <TableCell>{req.project?.title}</TableCell>
                            <TableCell><Badge variant="outline">{req.applicant?.experienceLevel || "N/A"}</Badge></TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleRequestAction(req._id, 'rejected')}>
                                        <X className="h-4 w-4 mr-1"/> Reject
                                    </Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRequestAction(req._id, 'accepted')}>
                                        <Check className="h-4 w-4 mr-1"/> Accept
                                    </Button>
                                </div>
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              ) : (
                  <div className="text-center py-8 text-muted-foreground">
                      <p>No pending requests.</p>
                  </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}