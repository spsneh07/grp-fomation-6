"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // ✅ Import Session
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; 

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession(); // ✅ Use Session Hook
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    jobTitle: "",
    bio: "",
  });

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") return;

    // 1. Try to get email from Google Session
    if (session?.user?.email) {
        setUserEmail(session.user.email);
        return;
    }

    // 2. Fallback: Try LocalStorage (For manual email/pass users)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const { email } = JSON.parse(storedUser);
      setUserEmail(email);
    } else {
      // 3. Only redirect if BOTH are missing
      router.push("/login");
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/users/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          jobTitle: formData.jobTitle,
          bio: formData.bio
        }),
      });

      if (res.ok) {
        // ✅ CRITICAL: Force a session reload so the frontend knows the flag flipped
        // Since we can't easily force-reload the session server-side here, 
        // we manually update localStorage as a temporary patch for the Dashboard to see
        
        const manualUpdate = { 
            hasCompletedOnboarding: true,
            email: userEmail, 
            name: session?.user?.name || "User"
        };
        localStorage.setItem("user", JSON.stringify(manualUpdate));

        toast.success("Profile Setup Complete!", {
            description: "Jumping into your dashboard..."
        });
        
        // Use window.location to force a full refresh, ensuring Session callback runs again
        window.location.href = "/dashboard"; 
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Connection Error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    // ... (Rest of your JSX is fine, keep it exactly as it was) ...
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Let's Finish Setting Up</CardTitle>
          <CardDescription className="text-center">
            Tell us a bit about yourself to personalize your SynergyHub experience.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title / Role</Label>
              <Input 
                id="jobTitle" 
                placeholder="e.g. Senior Developer, Product Manager" 
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="What are you working on? (Optional)" 
                className="min-h-[100px]"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Profile...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}