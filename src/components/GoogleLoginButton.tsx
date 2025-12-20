"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc"; // You might need to install react-icons: npm install react-icons

export default function GoogleLoginButton() {
  return (
    <Button 
      variant="outline" 
      className="w-full flex gap-2" 
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    >
      <FcGoogle className="h-5 w-5" />
      Continue with Google
    </Button>
  );
}