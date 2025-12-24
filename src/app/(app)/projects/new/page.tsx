'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, PlusCircle, Loader2, Sparkles, Rocket, ChevronDown } from 'lucide-react';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

export default function CreateProjectPage() {
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

    // Roles State
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const availableRoles = ['Team Lead', 'Developer', 'Designer', 'Operations', 'Tester', 'Product Manager'];

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
            toast.error("Error", { description: "You must be logged in." });
            return;
        }

        setLoading(true);

        try {
            const payload = {
                title,
                description, // Send clean description
                techStack: skills,
                githubLink: repoLink,
                roles: selectedRoles,
                owner: userId,
                type,
                timeCommitment,
                teamSize: Number(teamSize)
            };

            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success("Project Created! 🎉", { description: "Your project is now live." });
                router.push('/projects');
            } else {
                throw new Error("Failed to save project");
            }

        } catch (error) {
            console.error(error);
            toast.error("Error", { description: "Something went wrong." });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="text-center space-y-2 mb-8">
                <h1 className="font-headline text-4xl font-bold tracking-tight">Launch Your Idea</h1>
                <p className="text-muted-foreground text-lg">Create a workspace, find your team, and build something amazing.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50"></div>

                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                            <Rocket className="w-6 h-6 text-primary" /> Project Details
                        </CardTitle>
                        <CardDescription>Tell us about what you're building.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8">

                        {/* Title & Description */}
                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-base font-semibold">Project Title</Label>
                                <Input
                                    id="title"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. AI-Powered Task Manager"
                                    className="bg-background/50 text-lg h-12 border-border/60 focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base font-semibold">Elevator Pitch</Label>
                                <Textarea
                                    id="description"
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your project's goal, target audience, and key features..."
                                    className="min-h-[120px] bg-background/50 border-border/60 focus:border-primary/50 resize-y"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold">Project Type</Label>
                            <div className="relative">
                                <select
                                    required
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none border-border/60"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="" disabled className="bg-background text-foreground">Select type</option>
                                    <option value="Hackathon" className="bg-background text-foreground">Hackathon</option>
                                    <option value="NGO" className="bg-background text-foreground">NGO</option>
                                    <option value="Startup" className="bg-background text-foreground">Startup</option>
                                    <option value="Social" className="bg-background text-foreground">Social</option>
                                    <option value="Personal" className="bg-background text-foreground">Personal Portfolio</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Time Commitment</Label>
                            <div className="relative">
                                <select
                                    required
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none border-border/60"
                                    value={timeCommitment}
                                    onChange={(e) => setTimeCommitment(e.target.value)}
                                >
                                    <option value="" disabled className="bg-background text-foreground">Select commitment</option>
                                    <option value="Part-time" className="bg-background text-foreground">Part-time (&lt; 10hrs/wk)</option>
                                    <option value="Full-time" className="bg-background text-foreground">Full-time (&gt; 30hrs/wk)</option>
                                    <option value="Casual" className="bg-background text-foreground">Casual / Weekend</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                            </div>
                        </div>

                        {/* Team & Repo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="font-semibold">Target Team Size</Label>
                                <Input
                                    type="number"
                                    required
                                    value={teamSize}
                                    onChange={(e) => setTeamSize(e.target.value)}
                                    className="bg-background/50 border-border/60 h-10"
                                    min="1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold">Repository Link (Optional)</Label>
                                <Input
                                    placeholder="https://github.com/username/repo"
                                    value={repoLink}
                                    onChange={(e) => setRepoLink(e.target.value)}
                                    className="bg-background/50 border-border/60 h-10"
                                />
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="space-y-3">
                            <Label className="font-semibold">Tech Stack & Skills</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="e.g. React, Python, AWS..."
                                    value={currentSkill}
                                    onChange={(e) => setCurrentSkill(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    className="bg-background/50 border-border/60 h-10 focus:ring-primary/50"
                                />
                                <Button type="button" onClick={addSkill} className="shrink-0 h-10"><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-lg bg-muted/20 border border-border/30 border-dashed">
                                {skills.length === 0 && <span className="text-sm text-muted-foreground w-full text-center py-1">No skills added yet</span>}
                                {skills.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="pl-3 pr-2 py-1 flex items-center gap-1 bg-secondary hover:bg-secondary/80">
                                        {skill} <X className="h-3 w-3 cursor-pointer opacity-50 hover:opacity-100" onClick={() => removeSkill(skill)} />
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Required Roles */}
                        <div className="space-y-4 pt-2">
                            <Label className="font-semibold">Who are you looking for?</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {availableRoles.map((role) => (
                                    <div
                                        key={role}
                                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-all
                                            ${selectedRoles.includes(role)
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border/60 hover:border-primary/30 hover:bg-muted/30'
                                            }`}
                                    >
                                        <Checkbox
                                            id={`role-${role}`}
                                            checked={selectedRoles.includes(role)}
                                            onCheckedChange={(checked) => {
                                                setSelectedRoles((prev) =>
                                                    checked
                                                        ? [...prev, role]
                                                        : prev.filter((r) => r !== role)
                                                );
                                            }}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />

                                        <Label
                                            htmlFor={`role-${role}`}
                                            className="font-normal cursor-pointer flex-grow"
                                        >
                                            {role}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="pt-2 pb-8 flex justify-end">
                        <Button type="submit" size="lg" className="w-full md:w-auto h-12 px-8 text-base shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform" disabled={loading}>
                            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Launching...</> : <><Rocket className="mr-2 h-5 w-5" /> Launch Project</>}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div >
    );
}