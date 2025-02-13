"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated by looking for access token
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/sign-in");
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  const handleSignOut = () => {
    // Clear authentication tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    toast.success("Successfully signed out!");
    router.push("/sign-in");
  };

  // Show nothing while checking authentication
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome!</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSignOut}
            className="w-full"
            variant="destructive"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
