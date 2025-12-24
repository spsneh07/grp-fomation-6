"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    User, Award, Book, Loader2, Edit3, Mail, Globe, Github, Linkedin, 
    Briefcase, Clock, Calendar // ✅ Added new icons
} from 'lucide-react';
import { demoUser } from '@/lib/data';
import Link from 'next/link';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(demoUser);
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
            } finally {
                setLoading(false);
            }
        };

        if (currentUserId) {
            fetchLatestProfile();
        }
    }, [router]);

    if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    const hasSocials = user.socialLinks && Object.values(user.socialLinks).some(link => link);

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-xl shadow-lg">
                {/* Cover Gradient/Image Simulation */}
                <div className="h-32 bg-gradient-to-r from-primary/20 via-violet-500/10 to-blue-500/20" />

                <div className="px-8 pb-8 flex flex-col md:flex-row gap-6 items-start -mt-12">
                    <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
                        <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
                        <AvatarFallback className="text-3xl bg-primary text-primary-foreground">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2 mt-12 md:mt-14">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
                                <p className="text-muted-foreground font-medium text-lg">{user.jobTitle || "Member"}</p>
                            </div>
                            <Button variant="outline" className="shadow-sm gap-2" asChild>
                                <Link href="/profile/edit">
                                    <Edit3 className="w-4 h-4" /> Edit Profile
                                </Link>
                            </Button>
                        </div>

                        {/* ✅ UPDATED: User Details Row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" /> 
                                {user.email}
                            </span>
                            
                            {/* Experience Level Badge */}
                            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-foreground text-xs font-medium border border-border flex items-center gap-1.5">
                                <Briefcase className="w-3 h-3 text-primary" />
                                {user.experienceLevel || "Beginner"}
                            </span>

                            {/* ✅ Availability Badge (New) */}
                            <span className="px-2 py-0.5 rounded-md bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-medium border border-green-200 dark:border-green-900 flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                {user.availability || "Part-time"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content: Bio & Skills */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-xl border-border/40">
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">About Me</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {user.bio || "This user hasn't written a bio yet. They are likely busy building awesome things."}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-xl border-border/40">
                        <CardHeader>
                            <CardTitle className="font-headline text-xl flex items-center gap-2"><Award className="w-5 h-5 text-yellow-500" /> Skills & Expertise</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.skills && user.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.skills.map((skill: any, index: number) => {
                                        // Handle both legacy string format and new object format
                                        const isObj = typeof skill !== 'string';
                                        const skillName = isObj ? skill.name : skill;
                                        const skillLevel = isObj ? skill.level : null;
                                        const skillMode = isObj ? skill.mode : null;

                                        return (
                                            <Badge key={index} variant="secondary" className="pl-3 pr-2 py-1.5 text-sm border-border/50 bg-background/50 gap-2 items-center hover:bg-background/80 transition-colors">
                                                <span>{skillName}</span>
                                                
                                                {/* ✅ Show Level (Beginner/Intermediate/Advanced) */}
                                                {skillLevel && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase font-bold tracking-wider">
                                                        {skillLevel}
                                                    </span>
                                                )}

                                                {/* ✅ Show Expert Star */}
                                                {skillMode === 'Expert' && (
                                                    <div className="bg-yellow-500/10 p-0.5 rounded-full" title="Expert">
                                                        <Award className="w-3 h-3 text-yellow-500" />
                                                    </div>
                                                )}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center p-6 border-2 border-dashed border-border/30 rounded-lg">
                                    <p className="text-muted-foreground">No skills added yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Stats/Info (Placeholder for now) */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Community Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Projects Joined</span>
                                <span className="font-bold text-foreground">0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Contributions</span>
                                <span className="font-bold text-foreground">0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Reputation</span>
                                <span className="font-bold text-foreground text-primary">Newcomer</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social Links Card */}
                    {hasSocials && (
                        <Card className="bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-xl border-border/40">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" /> Connect</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {user.socialLinks?.github && (
                                    <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md group-hover:scale-105 transition-transform"><Github className="w-4 h-4" /></div>
                                        <span className="text-sm font-medium">GitHub</span>
                                    </a>
                                )}
                                {user.socialLinks?.linkedin && (
                                    <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md group-hover:scale-105 transition-transform"><Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                                        <span className="text-sm font-medium">LinkedIn</span>
                                    </a>
                                )}
                                {user.socialLinks?.portfolio && (
                                    <a href={user.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-md group-hover:scale-105 transition-transform"><Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" /></div>
                                        <span className="text-sm font-medium">Portfolio</span>
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}