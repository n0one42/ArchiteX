"use client";

import { useAuth } from "@/auth/lib/authContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

export default function Home() {
  const { logout, user } = useAuth();

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
              className="w-full"
              onClick={() => {
                toast.success("This is a success toast!");
                toast.error("This is an error toast!");
                toast.info("This is an info toast!");
                toast.warning("This is a warning toast!");
              }}
              variant="outline"
            >
              Test Toasts
            </Button>
            <Link
              className="w-full"
              href="/debug"
            >
              <Button
                className="w-full"
                type="button"
                variant="outline"
              >
                Debug Page
              </Button>
            </Link>
            <Button
              className="w-full"
              onClick={handleSignOut}
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
