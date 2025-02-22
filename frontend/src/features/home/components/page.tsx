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
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">TechCorp Solutions</h1>
        <p className="text-xl text-muted-foreground">Innovating for a better tomorrow</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Digital Transformation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We help businesses modernize their operations through cutting-edge technology solutions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cloud Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Secure and scalable cloud infrastructure to power your business growth.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Software</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Tailored software solutions designed to meet your unique business needs.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 flex justify-center">
        {user ? (
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome Back!</CardTitle>
              <p className="text-sm text-muted-foreground">Logged in as: {user.email}</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Link
                  className="w-full"
                  href="/testing/test1"
                >
                  <Button
                    className="w-full"
                    variant="outline"
                  >
                    Go to Dashboard
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
        ) : (
          <Link href="/sign-in">
            <Button size="lg">Sign In to Dashboard</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
