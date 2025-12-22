"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, UserPlus, MapPin, Briefcase, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchProfilesPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Function to fetch users based on search query
  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm) {
      setResults([]);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();

      if (res.ok) {
        setResults(data.users || []);
      }
    } catch (error) {
      console.error("Failed to search users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        searchUsers(query);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-20">
      {/* Header & Search Input */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8 items-center text-center mt-10"
      >
        <div className="space-y-4">
          <Badge variant="outline" className="py-1 px-3 border-primary/30 bg-primary/10 text-primary uppercase tracking-wider text-xs">Network</Badge>
          <h1 className="text-5xl font-bold font-headline tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-white/60">Find Collaborators</h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Connect with skilled developers for your next big project. <br className="hidden sm:block" />
            Search by name, role, or skills.
          </p>
        </div>

        <div className="relative w-full max-w-2xl group z-10">
          <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full opacity-20 group-focus-within:opacity-60 transition-opacity duration-700" />
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
            <Input
              placeholder="Try searching 'React', 'Backend', or 'John'..."
              className="pl-14 h-16 text-lg rounded-full border-slate-200 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-2xl focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all placeholder:text-muted-foreground/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {loading && !results.length ? (
            // Skeleton / Loading State kept minimal as indicator is in input
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-muted-foreground"
            >
              <p className="text-lg animate-pulse">Scouring the network...</p>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div
              key="results"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {results.map((user, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={user._id}
                >
                  <Card className="flex flex-col h-full border-slate-200 dark:border-white/5 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-md transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden relative shadow-sm dark:shadow-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <CardHeader className="flex flex-row items-center gap-4 pb-4 relative z-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-violet-500 rounded-full blur opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
                        <Avatar className="h-16 w-16 border-2 border-slate-200 dark:border-white/10 group-hover:border-transparent transition-colors relative z-10">
                          <AvatarImage src={user.image || user.avatarUrl} alt={user.name} />
                          <AvatarFallback className="text-xl font-bold bg-slate-100 dark:bg-white/10 text-primary">{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <CardTitle className="text-lg truncate font-headline group-hover:text-primary transition-colors">{user.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 truncate text-sm mt-1 text-muted-foreground/80">
                          <Briefcase className="h-3.5 w-3.5 text-primary/70" />
                          {user.title || "Developer"}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow relative z-10">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10 leading-relaxed font-light">
                        {user.bio || "Passionate developer looking for exciting projects."}
                      </p>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {user.skills?.slice(0, 4).map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-[10px] px-2 py-0.5 h-6 bg-slate-100 dark:bg-primary/10 text-muted-foreground dark:text-primary border border-slate-200 dark:border-primary/10 hover:bg-slate-200 dark:hover:bg-primary/20 transition-colors">
                            {skill}
                          </Badge>
                        ))}
                        {(user.skills?.length || 0) > 4 && (
                          <Badge variant="outline" className="text-[10px] h-6 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-muted-foreground">+{user.skills.length - 4}</Badge>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2 relative z-10">
                      <Button className="w-full gap-2 bg-slate-100 dark:bg-white/5 hover:bg-primary hover:text-white border border-slate-200 dark:border-white/10 hover:border-primary/20 transition-all font-medium group/btn" variant="outline" asChild>
                        <Link href={`/profile/${user._id}`}>
                          View Profile <Zap className="w-3.5 h-3.5 group-hover/btn:fill-current" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : hasSearched ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 text-muted-foreground bg-white/60 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 max-w-lg mx-auto"
            >
              <div className="h-16 w-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5">
                <UserPlus className="h-8 w-8 opacity-30" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">No profiles found</h3>
              <p className="max-w-xs mx-auto text-sm leading-relaxed">
                We couldn't find anyone matching "{query}".
                Try searching for specific skills like <span className="text-primary font-medium">React</span> or <span className="text-primary font-medium">Design</span>.
              </p>
            </motion.div>
          ) : (
            /* Initial Empty State */
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 text-muted-foreground"
            >
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-50 animate-pulse-slow" />
                <div className="h-20 w-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center relative border border-slate-200 dark:border-white/10">
                  <Search className="h-8 w-8 opacity-40" />
                </div>
              </div>
              <h2 className="text-xl font-medium mb-2 text-foreground">Start exploring</h2>
              <p className="text-lg opacity-50 font-light">Type something above to discover <span className="text-primary opacity-100 font-medium">amazing talent</span>.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}