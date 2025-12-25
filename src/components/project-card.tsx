import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProjectCard({ project, isCreator = false }: { project: any; isCreator?: boolean }) {
    // CLEANUP: Handle legacy descriptions that have metadata appended
    const cleanDescription = project.description?.split('---')[0].trim() || "No description provided.";

    // PARSE LEGACY DATA: If structured fields are missing, try to extract from description
    let type = project.type;
    let commitment = project.timeCommitment;

    if (!type && project.description?.includes('Type:')) {
        const match = project.description.match(/Type: (.*?)(\n|$|•)/);
        if (match) type = match[1].trim();
    }
    if (!commitment && project.description?.includes('Commitment:')) {
        const match = project.description.match(/Commitment: (.*?)(\n|$|•)/);
        if (match) commitment = match[1].trim();
    }

    const ownerName = (project.owner?.name && project.owner.name.trim()) ? project.owner.name : "Unknown User";
    const ownerAvatar = project.owner?.avatarUrl;

    return (
        <Card className="flex flex-col h-full border-slate-200 dark:border-white/5 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-md transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden relative shadow-sm dark:shadow-none">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <CardHeader className="pb-3 relative z-10">
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1.5 flex-1">
                        <CardTitle className="font-headline text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">{project.title}</CardTitle>

                        {/* Owner Info */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="opacity-70">by</span>
                                <div className="flex items-center gap-1.5 font-medium text-foreground">
                                    <Avatar className="h-4 w-4 border border-border">
                                        <AvatarImage src={ownerAvatar} />
                                        <AvatarFallback className="text-[8px]">{ownerName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-foreground">{ownerName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground pt-1">
                            {type && <span className="flex items-center gap-1 bg-white/50 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5"><Sparkles className="h-3 w-3" /> {type}</span>}
                            {commitment && <span className="flex items-center gap-1 opacity-70">| {commitment}</span>}
                        </div>
                    </div>
                    <Badge variant={project.status === "Closed" ? "secondary" : "outline"} className={`shrink-0 border-slate-200 dark:border-white/10 ${project.status === 'Open' ? 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20' : 'bg-slate-100 dark:bg-white/5'}`}>
                        {project.status || "Active"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="flex-grow space-y-4 relative z-10">
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed min-h-[60px]">
                    {cleanDescription}
                </p>

                <div className="flex flex-wrap gap-2">
                    {project.techStack?.slice(0, 3).map((tech: string) => (
                        <Badge key={tech} variant="secondary" className="text-[10px] px-2 py-0.5 h-6 bg-primary/10 text-primary border border-primary/10 hover:bg-primary/20 transition-colors">
                            {tech}
                        </Badge>
                    ))}
                    {project.techStack?.length > 3 && (
                        <Badge variant="outline" className="text-[10px] h-6 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-muted-foreground">+{project.techStack.length - 3}</Badge>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5">
                    <div className="flex items-center text-xs text-muted-foreground font-medium">
                        <Users className="mr-2 h-3.5 w-3.5" />
                        <span className="">{project.team ? project.team.length + 1 : 1} / {project.teamSize || project.description?.match(/Team Size Goal: (\d+)/)?.[1] || 1} Members</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-2 relative z-10">
                <Button asChild variant={isCreator ? "default" : "secondary"} className={`w-full ${isCreator ? 'bg-primary hover:bg-primary/90 shadow-[0_0_15px_-5px_var(--primary)]' : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white border border-slate-200 dark:border-white/10'} transition-all`}>
                    <Link href={`/projects/${project._id}/collaborate`}>
                        {isCreator ? "Manage Workspace" : "Open Workspace"}
                    </Link>
                </Button>
            </CardFooter>
        </Card >
    );
}
