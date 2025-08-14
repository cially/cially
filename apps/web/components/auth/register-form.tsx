"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import RegistrationHandler from "./registrationHandler";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const emailID = useId();
  const passwordID = useId();

  const handleLogin = async () => {
    try {
      const result = await RegistrationHandler({
        email,
        password,
      });
      console.log(result);
      if (result === "success") {
        router.push("/");
      } else {
        setError("Registration Failed");
      }
    } catch (err: any) {
      setError("Registration Failed");
      console.log(err);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Welcome to Cially</CardTitle>
          <CardDescription className="text-center">
            Please create an admin account below
          </CardDescription>
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
                <Button className="w-full text-white" type="submit">
                  Create Account
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
