"use client";

import { useAuth } from "@/auth/lib/authContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function Home() {
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    toast.success("Successfully signed out!");
  };

  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          {user?.email && <p className="text-sm text-muted-foreground">Logged in as: {user.email}</p>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => {
                toast.success("This is a success toast!");
                toast.error("This is an error toast!");
                toast.info("This is an info toast!");
                toast.warning("This is a warning toast!");
              }}
              className="w-full"
              variant="outline"
            >
              Test Toasts
            </Button>
            <Link
              href="/debug"
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full"
                type="button"
              >
                Debug Page
              </Button>
            </Link>
            <Button
              onClick={handleSignOut}
              className="w-full"
              variant="destructive"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
