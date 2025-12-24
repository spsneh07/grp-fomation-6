"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Info } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // 1. Fetch Notifications (Only when session exists)
  const fetchNotifications = async () => {
    // Ensure safe access to user ID
    if (!session?.user) return;

    // @ts-ignore
    const userId = session.user.id || session.user._id;
    if (!userId) return;

    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      if (!res.ok) return;

      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        const unread = data.notifications.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Notify Error:", error);
    }
  };

  // Poll for new notifications
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // 2. Mark as Read Handler
  const markAsRead = async (id: string, relatedId?: string) => {
    // Optimistic Update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id })
      });
    } catch (e) { console.error("Failed to mark as read", e); }

    if (relatedId) {
      setIsOpen(false);
      // Determine redirect path based on context (hack for now: all go to project collaboration)
      // Ideally, the notification type should dictate the URL.
      router.push(`/projects/${relatedId}/collaborate`);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <div className="hover:rotate-12 transition-transform duration-300">
            <Bell className="h-5 w-5" />
          </div>
          {unreadCount > 0 && (
            <span
              className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-background shadow-[0_0_10px_rgba(220,38,38,0.5)]"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-xl border border-border/40 bg-background/95 backdrop-blur-xl shadow-xl" align="end">
        <div className="px-4 py-3 border-b border-border/40 font-semibold flex justify-between items-center bg-muted/20">
          <span className="text-sm">Notifications</span>
          {unreadCount > 0 && <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] px-2 h-5 rounded-full border-0">{unreadCount} New</Badge>}
        </div>
        <ScrollArea className="h-[320px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground text-sm gap-2">
              <Bell className="h-8 w-8 opacity-20" />
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.map((note) => (
                <div
                  key={note._id}
                  className={cn(
                    "p-4 flex gap-3 text-sm transition-colors cursor-pointer relative group",
                    note.read ? "bg-transparent opacity-70 hover:opacity-100 hover:bg-muted/30" : "bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary"
                  )}
                  onClick={() => markAsRead(note._id, note.relatedId)}
                >
                  <div className={cn("mt-1.5 h-2 w-2 rounded-full flex-shrink-0", !note.read && "bg-primary")} />
                  <div className="flex-1 space-y-1">
                    <p className={cn("text-sm", !note.read && "font-medium text-foreground")}>
                      {note.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                      {new Date(note.createdAt).toLocaleDateString()} • {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!note.read && (
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded shadow-sm">Mark Read</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}