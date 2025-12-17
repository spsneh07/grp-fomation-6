'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, PlusCircle, Link as LinkIcon, AlertTriangle, Book, Award, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';

// Define types
type Skill = {
    id?: string;
    _id?: string;
    name: string;
    level: string;
    mode: string;
    verification: { type: string; url?: string };
};

export default function SettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // User State
    const [userId, setUserId] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        experienceLevel: "Beginner",
        availability: "Part-time",
        bio: ""
    });

    const [skills, setSkills] = useState<Skill[]>([]);
    const [currentSkill, setCurrentSkill] = useState('');

    // 1. Load User Data from Database
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }
        
        const parsedUser = JSON.parse(storedUser);
        const currentUserId = parsedUser.id || parsedUser._id;
        setUserId(currentUserId);

        // ✅ NEW: Fetch latest data from MongoDB
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/users/profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: currentUserId }),
                });
                const data = await res.json();

                if (data.user) {
                    const u = data.user;
                    
                    // Update Form Data
                    setFormData({
                        name: u.name || "",
                        email: u.email || parsedUser.email || "",
                        experienceLevel: u.experienceLevel || "Beginner",
                        availability: u.availability || "Part-time",
                        bio: u.bio || ""
                    });

                    // Update Skills (Map DB structure to UI structure)
                    if (u.skills && Array.isArray(u.skills)) {
                        const formattedSkills = u.skills.map((s: any, index: number) => ({
                            ...s,
                            id: s._id || `skill-${index}`, // Ensure UI key exists
                            mode: s.mode || 'Learner',     // Default if missing
                            verification: s.verification || { type: 'Self-Declared' }
                        }));
                        setSkills(formattedSkills);
                    }
                }
            } catch (error) {
                console.error("Failed to load profile", error);
                toast({ title: "Error", description: "Could not load latest profile data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router, toast]);

    // Skill Handlers
    const addSkill = () => {
        if (currentSkill && !skills.find(s => s.name.toLowerCase() === currentSkill.toLowerCase())) {
            const newSkill: Skill = {
                id: `new-${Date.now()}`,
                name: currentSkill,
                level: 'Beginner',
                mode: 'Learner',
                verification: { type: 'Self-Declared', url: '' }
            };
            setSkills([...skills, newSkill]);
            setCurrentSkill('');
        }
    };

    const removeSkill = (skillId: string) => {
        setSkills(skills.filter(s => (s.id !== skillId && s._id !== skillId)));
    };

    const handleUpdateSkill = (skillId: string, field: keyof Skill, value: any) => {
        setSkills(skills.map(s => (s.id === skillId || s._id === skillId) ? { ...s, [field]: value } : s));
    }

    // 2. Handle Save
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                userId, // API expects userId
                ...formData,
                skills // Sends full complex skill objects
            };

            // ✅ CHANGED: Use the correct API route
            const res = await fetch("/api/users/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                // Update Local Storage so other tabs/pages see changes immediately
                const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                const updatedUser = { ...currentUser, ...data.user };
                localStorage.setItem("user", JSON.stringify(updatedUser));

                toast({
                    title: "Profile Updated",
                    description: "Your changes have been saved successfully.",
                });
                router.refresh();
            } else {
                throw new Error(data.error || "Update failed");
            }
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to save profile.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center gap-2"><Loader2 className="animate-spin h-8 w-8 text-primary"/> Loading settings...</div>;

    return (
    <div className="space-y-8 max-w-4xl mx-auto py-10 px-4">
        <div>
            <h1 className="font-headline text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and profile information.</p>
        </div>

        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input 
                                id="name" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} disabled className="bg-muted"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="experience">Experience Level</Label>
                            <Select 
                                value={formData.experienceLevel} 
                                onValueChange={(val) => setFormData({...formData, experienceLevel: val})}
                            >
                                <SelectTrigger>
                                <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="availability">Availability</Label>
                             <Select 
                                value={formData.availability} 
                                onValueChange={(val) => setFormData({...formData, availability: val})}
                            >
                                <SelectTrigger>
                                <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Part-time">Part-time</SelectItem>
                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                    <SelectItem value="Flexible">Flexible</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Your Bio</Label>
                        <Textarea 
                            id="bio" 
                            value={formData.bio} 
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline">Manage Skills</CardTitle>
                    <CardDescription>Add, remove, or edit your skills.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                      <div className="flex gap-2">
                        <Input 
                            placeholder="Add a new skill (e.g. React)..."
                            value={currentSkill}
                            onChange={(e) => setCurrentSkill(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addSkill();
                                }
                            }}
                        />
                        <Button type="button" onClick={addSkill}><PlusCircle className="mr-2 h-4 w-4"/>Add</Button>
                    </div>
                    
                    <div className="space-y-4">
                        {skills.map((skill, index) => (
                            <div key={skill.id || index} className="p-4 border rounded-lg space-y-4 bg-card">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-lg">{skill.name}</h4>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(skill.id!)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                    <div>
                                        <Label className="text-sm">Proficiency</Label>
                                         <Select value={skill.level} onValueChange={(value) => handleUpdateSkill(skill.id!, 'level', value)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Beginner">Beginner</SelectItem>
                                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                <SelectItem value="Advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between mt-5 p-3 rounded-md bg-muted">
                                        <Label className="flex items-center gap-2"><Book className="h-4 w-4" /> Learner</Label>
                                        <Switch checked={skill.mode === 'Expert'} onCheckedChange={(checked) => handleUpdateSkill(skill.id!, 'mode', checked ? 'Expert' : 'Learner')} />
                                        <Label className="flex items-center gap-2">Expert <Award className="h-4 w-4" /></Label>
                                    </div>
                                </div>
                                <div>
                                    <Label>Verification Link</Label>
                                     <div className="flex items-center gap-2 mt-1">
                                        <Input 
                                            placeholder="https://github.com/..."
                                            value={skill.verification?.url || ""}
                                            onChange={(e) => handleUpdateSkill(skill.id!, 'verification', { type: e.target.value ? 'Link' : 'Self-Declared', url: e.target.value })}
                                        />
                                        {skill.verification?.type === 'Link' ? (
                                            <Badge variant="default" className="whitespace-nowrap"><LinkIcon className="mr-1 h-3 w-3"/> Verified</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="whitespace-nowrap"><AlertTriangle className="mr-1 h-3 w-3"/> Self</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

             <div className="mt-8 flex justify-end pb-10">
                <Button type="submit" disabled={saving} size="lg">
                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Save Changes"}
                </Button>
            </div>
        </form>
    </div>
  );
}