"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function TestingPage() {
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Test Page</CardTitle>
          <CardDescription>
            This is a protected test page to verify authentication and callback URL functionality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>If you can see this page, you are successfully authenticated!</p>
          {currentUrl && <p className="mt-4 text-muted-foreground">Current URL: {currentUrl}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
