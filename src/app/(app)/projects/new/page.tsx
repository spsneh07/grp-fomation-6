'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, PlusCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function CreateProjectPage() {
    const { toast } = useToast();
    const router = useRouter();
    
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [timeCommitment, setTimeCommitment] = useState('');
    const [teamSize, setTeamSize] = useState('');
    const [repoLink, setRepoLink] = useState('');
    
    // Skills State
    const [skills, setSkills] = useState<string[]>([]);
    const [currentSkill, setCurrentSkill] = useState('');

    // ✅ NEW: Roles State
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const availableRoles = ['Team Lead', 'Developer', 'Designer', 'Operations', 'Tester', 'Product Manager'];

    // 1. Check Auth on Load
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
        } else {
            const user = JSON.parse(storedUser);
            setUserId(user.id || user._id);
        }
    }, [router]);

    const addSkill = () => {
        if (currentSkill && !skills.includes(currentSkill)) {
            setSkills([...skills, currentSkill]);
            setCurrentSkill('');
        }
    };
    
    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    // ✅ NEW: Toggle Roles
    const toggleRole = (role: string) => {
        setSelectedRoles(prev => 
            prev.includes(role) 
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!userId) {
            toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }

        setLoading(true);

        const richDescription = `
${description}

---
**Project Details**
• Type: ${type}
• Commitment: ${timeCommitment}
• Team Size Goal: ${teamSize}
        `.trim();

        try {
            const payload = {
                title,
                description: richDescription,
                techStack: skills,
                githubLink: repoLink,
                roles: selectedRoles, // ✅ SEND ROLES TO API
                owner: userId
            };

            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast({ title: "Project Created! 🎉", description: "Your project is now live." });
                router.push('/dashboard');
            } else {
                throw new Error("Failed to save project");
            }

        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <Button variant="ghost" asChild>
            <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard</Link>
        </Button>
      
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                <CardTitle className="font-headline text-3xl">Create a New Project</CardTitle>
                <CardDescription>Fill out the details below to get your project started.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                
                {/* Title & Description */}
                <div className="space-y-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea id="description" required value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                {/* Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <Label>Project Type</Label>
                    <Select required onValueChange={setType}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Hackathon">Hackathon</SelectItem>
                        <SelectItem value="NGO">NGO</SelectItem>
                        <SelectItem value="Startup">Startup</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                    <div className="space-y-2">
                    <Label>Time Commitment</Label>
                    <Select required onValueChange={setTimeCommitment}>
                        <SelectTrigger><SelectValue placeholder="Select commitment" /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                </div>

                {/* Team & Repo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <Label>Team Size</Label>
                    <Input type="number" required value={teamSize} onChange={(e) => setTeamSize(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label>Repository Link</Label>
                    <Input placeholder="https://github.com/..." value={repoLink} onChange={(e) => setRepoLink(e.target.value)} />
                    </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                    <Label>Required Skills</Label>
                    <div className="flex items-center gap-2">
                        <Input 
                            placeholder="Add a skill..." 
                            value={currentSkill}
                            onChange={(e) => setCurrentSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button type="button" variant="outline" onClick={addSkill}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                            {skill} <X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                        </Badge>
                        ))}
                    </div>
                </div>

                {/* ✅ UPDATED: Required Roles */}
                <div className="space-y-4">
                    <Label>Required Roles</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {availableRoles.map((role) => (
                            <div key={role} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`role-${role}`} 
                                    checked={selectedRoles.includes(role)}
                                    onCheckedChange={() => toggleRole(role)}
                                />
                                <Label htmlFor={`role-${role}`} className="font-normal cursor-pointer" onClick={() => toggleRole(role)}>
                                    {role}
                                </Label>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Select the roles you are actively looking for.</p>
                </div>

                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full md:w-auto" disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Creating...</> : "Create Project"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </div>
  );
}