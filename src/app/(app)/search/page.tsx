"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, UserPlus, MapPin, Briefcase, Sparkles, Zap, Brain, FolderKanban } from "lucide-react";
import Link from "next/link";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // WAIT, I don't want to replace tabs import. I want to remove line 12.
// Line 12 is: // import { motion, AnimatePresence } from "framer-motion";
// I will just replace it with empty string or nothing? replace_file_content replaces the target.

import { ProjectCard } from "@/components/project-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SearchMode = 'basic' | 'smart' | 'projects';

export default function SearchProfilesPage() {
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [mode, setMode] = useState<SearchMode>((typeParam === 'projects' ? 'projects' : 'basic') as SearchMode);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);
        return () => clearTimeout(handler);
    }, [query]);

    useEffect(() => {
        if (debouncedQuery.trim().length > 0) {
            handleSearch();
        } else {
            setResults([]);
        }
    }, [debouncedQuery, mode]);

    const handleSearch = async () => {
        if (!debouncedQuery.trim()) return;

        setLoading(true);
        try {
            let endpoint = '';
            if (mode === 'smart') endpoint = '/api/users/search/smart';
            else if (mode === 'projects') endpoint = '/api/projects/search';
            else endpoint = '/api/users/search';

            const res = await fetch(`${endpoint}?q=${encodeURIComponent(debouncedQuery)}`);
            const data = await res.json();

            if (mode === 'projects') {
                setResults(data.projects || []);
            } else {
                setResults(data.users || []);
            }
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pt-6 pb-20 max-w-5xl mx-auto px-4 min-h-screen">

            {/* HEADER */}
            <div className="space-y-2 text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Find Collaborators</h1>
                <p className="text-muted-foreground">Discover talented individuals for your next project.</p>
            </div>

            {/* SEARCH BAR */}
            <div className="sticky top-4 z-30 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border/50 shadow-sm">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder={
                                    mode === 'smart' ? "Describe who you're looking for..." :
                                        mode === 'projects' ? "Search projects by title, stack, or type..." :
                                            "Search by name, skill, or role..."
                                }
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-10 h-12 bg-muted/50 border-input/50 focus:bg-background transition-all"
                            />
                        </div>
                    </div>

                    <Tabs value={mode} onValueChange={(v) => setMode(v as SearchMode)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">Basic Search</TabsTrigger>
                            <TabsTrigger value="projects"><FolderKanban className="w-3 h-3 mr-2" /> Projects</TabsTrigger>
                            <TabsTrigger value="smart" className="text-primary"><Sparkles className="w-3 h-3 mr-2" /> AI Smart Match</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* RESULTS GRID */}
            <div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
                {loading ? (
                    <div className="col-span-full py-12 text-center space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="text-muted-foreground">Searching network...</p>
                    </div>
                ) : results.length > 0 ? (
                    results.map((item) => (
                        <div key={item._id} className="h-full animate-in fade-in duration-500">
                            {mode === 'projects' ? (
                                <ProjectCard project={item} />
                            ) : (
                                <Card className="h-full hover:shadow-lg transition-all hover:border-primary/30 group bg-card/50 backdrop-blur-sm">
                                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                        <Avatar className="h-12 w-12 border-2 border-background ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                                            <AvatarImage src={item.avatarUrl} />
                                            <AvatarFallback className="bg-primary/5 text-primary font-bold">{item.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <CardTitle className="text-lg font-bold truncate group-hover:text-primary transition-colors">{item.name}</CardTitle>
                                            <CardDescription className="truncate">{item.jobTitle || "Member"}</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {item.bio && <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{item.bio}</p>}

                                        <div className="flex flex-wrap gap-1.5 h-[52px] overflow-hidden content-start">
                                            {item.skills?.slice(0, 4).map((skill: any, i: number) => (
                                                <Badge key={i} variant="secondary" className="px-2 py-0.5 text-xs bg-secondary/50">{typeof skill === 'string' ? skill : skill.name}</Badge>
                                            ))}
                                            {item.skills?.length > 4 && <Badge variant="outline" className="text-xs">+{item.skills.length - 4}</Badge>}
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-2">
                                            <div className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {item.experienceLevel || "Beginner"}</div>
                                            <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location || "Remote"}</div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full gap-2 shadow-lg shadow-primary/5 group-hover:shadow-primary/20 transition-all" asChild>
                                            <Link href={`/users/${item._id}`}>
                                                <UserPlus className="w-4 h-4" /> View Profile
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}
                        </div>
                    ))
                ) : (
                    query && (
                        <div className="col-span-full py-20 text-center space-y-4 opacity-70">
                            <Search className="w-12 h-12 mx-auto text-muted-foreground/30" />
                            <h3 className="text-lg font-medium">No results found</h3>
                            <p className="text-muted-foreground">Try adjusting your search terms</p>
                        </div>
                    )
                )}
            </div>

            {!query && (
                <div className="text-center py-20 opacity-50 space-y-4">
                    <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Brain className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">Start Exploring</h2>
                    <p className="max-w-md mx-auto text-muted-foreground">Search for skills like "React", "Python", or roles like "Designer". Try Smart Match to find people by description, or browse Projects.</p>
                </div>
            )}
        </div>
    );
}
