"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // STEP 1: Send OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if(res.ok) {
        toast({ title: "OTP Sent", description: "Check your email (or console for dev mode)." });
        setStep(2); // Move to next step
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify & Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      if (res.ok) {
        toast({ title: "Success!", description: "Password reset. Please login." });
        router.push("/login");
      } else {
        toast({ title: "Error", description: "Invalid OTP", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{step === 1 ? "Forgot Password" : "Reset Password"}</CardTitle>
          <CardDescription>
            {step === 1 ? "Enter your email to receive a code." : `Enter the code sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <Input 
                type="email" placeholder="Email Address" required 
                value={email} onChange={(e) => setEmail(e.target.value)} 
              />
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input 
                type="text" placeholder="Enter 6-digit OTP" required 
                value={otp} onChange={(e) => setOtp(e.target.value)} 
              />
              <Input 
                type="password" placeholder="New Password" required 
                value={password} onChange={(e) => setPassword(e.target.value)} 
              />
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Change Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}