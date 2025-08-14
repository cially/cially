"use client";

import { useRouter } from "next/navigation";
import PocketBase from "pocketbase";
import { useEffect, useId, useMemo, useState } from "react";
import GuestLogin from "@/components/auth/guestLogin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pocketbaseUrl, setPocketbaseUrl] = useState("");

  // Initialize PocketBase client with the fetched URL
  const pb = useMemo(() => {
    if (pocketbaseUrl) {
      return new PocketBase(pocketbaseUrl);
    }
    return null;
  }, [pocketbaseUrl]);

  const emailID = useId();
  const passwordID = useId();

  useEffect(() => {
    async function fetchPocketbaseUrl() {
      try {
        const configResponse = await fetch("/api/cially/pocketbaseURL");
        const config = await configResponse.json();
        setPocketbaseUrl(config.url);
      } catch (error) {
        console.error("Failed to fetch PocketBase URL:", error);
      }
    }
    fetchPocketbaseUrl();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pb) {
      setError("Configuration not loaded");
      return;
    }

    try {
      await pb.collection("users").authWithPassword(email, password);

      const cookieStr = pb.authStore.exportToCookie({ httpOnly: false });
      document.cookie = cookieStr;

      // redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("Invalid email or password");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Login to Cially</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id={emailID}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  type="email"
                  value={email}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id={passwordID}
                  minLength={8}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </div>
              {error && <p className="-mt-4 text-red-500 text-sm">{error}</p>}
              <div className="flex flex-col gap-3">
                <Button className="w-full" disabled={!pb} type="submit">
                  Login
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-2 place-self-center">
            <GuestLogin />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
