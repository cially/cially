"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  RefreshCw,
  Server,
  Activity,
  Terminal,
  Sparkles,
  Info,
  Check,
  XCircle,
  Database,
  Bot,
  Globe,
  AlertCircle,
  Rss,
  Antenna
} from "lucide-react";
import Image from "next/image";

const greetings = [
  { text: "Welcome", lang: "English" },
  { text: "Bienvenue", lang: "French" },
  { text: "Willkommen", lang: "German" },
  { text: "Bienvenido", lang: "Spanish" },
  { text: "Benvenuto", lang: "Italian" },
  { text: "Καλώς ορίσατε", lang: "Greek" },
  { text: "ようこそ", lang: "Japanese" },
  { text: "Välkommen", lang: "Swedish" },
  { text: "Bem-vindo", lang: "Portuguese" },
];

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Status check states
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [status, setStatus] = useState({
    pocketbase: "checking",
    bot: "checking",
    discord: "checking",
  });

  // Welcome language switcher
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [greetingVisible, setGreetingVisible] = useState(true);

  const emailID = useId();
  const passwordID = useId();

  // Switch greetings
  useEffect(() => {
    if (step !== 1) return;
    const interval = setInterval(() => {
      setGreetingVisible(false);
      setTimeout(() => {
        setGreetingIndex((prev) => (prev + 1) % greetings.length);
        setGreetingVisible(true);
      }, 350); // Time to fade out
    }, 2200);
    return () => clearInterval(interval);
  }, [step]);

  // Check service status when loading step 3
  useEffect(() => {
    if (step === 3) {
      checkServicesStatus();
    }
  }, [step]);

  const checkServicesStatus = async () => {
    setCheckingStatus(true);
    setError("");
    try {
      const res = await fetch("/api/cially/checkStatus");
      if (!res.ok) throw new Error("Failed to check status");
      const data = await res.json();

      setStatus({
        pocketbase: data.pocketbase || "offline",
        bot: data.bot || "offline",
        discord: data.discord || "offline",
      });
    } catch (err) {
      console.error("Connectivity check failed:", err);
      setStatus({
        pocketbase: "offline",
        bot: "offline",
        discord: "offline",
      });
      setError("Could not connect to the internal Cially monitoring router.");
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. Submit Registration
      const response = await fetch("/api/cially/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        // 2. Perform Automatic Authentication/Login
        try {
          const authResponse = await fetch("/api/cially/auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          if (authResponse.ok) {
            setStep(6);
          } else {
            console.warn("Auto login call returned non-200. Proceeding to success screen.");
            setStep(6);
          }
        } catch (authErr) {
          console.error("Auto login failed:", authErr);
          setStep(6); // Continue to success screen regardless
        }
      } else {
        setError(data.error || "Registration Failed");
      }
    } catch (err: any) {
      setError("Registration Failed");
      console.error("Registration failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "checking") {
      return (
        <Badge
          className="flex w-fit items-center gap-1.5 px-2.5 py-0.5 font-medium border-0 bg-yellow-500/10 text-yellow-500"
          variant="outline"
        >
          <RefreshCw className="h-3 w-3 animate-spin" />
          Checking
        </Badge>
      );
    }
    const isOnline = status === "online";
    return (
      <Badge
        className={`flex w-fit items-center gap-1.5 px-2.5 py-0.5 font-medium border-0 ${
          isOnline
            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
            : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
        }`}
        variant="outline"
      >
        {isOnline ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <XCircle className="h-3.5 w-3.5" />
        )}
        {isOnline ? "Operational" : "Offline"}
      </Badge>
    );
  };

  return (
    <div className={cn("flex flex-col gap-6 relative w-full", className)} {...props}>
      {/* Global Embedded Styles for Custom Premium Micro-animations */}
      <style>{`
        @keyframes scale-up {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in-up {
          0% { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <Card className="overflow-hidden relative py-0">
        {step === 1 && (
          <div className="animate-fade-in-up flex flex-col items-center p-6 text-center">
            <div className="flex justify-center mb-2">
              <Image
                src="/logo-webp.webp"
                alt="Cially Logo"
                className="w-24 h-24 object-contain rounded-xl select-none"
                loading="eager"
                width={1920}
                height={1080}
              />
            </div>
            <div className="h-12 flex items-center justify-center">
              <h1
                className={cn(
                  "text-4xl md:text-5xl font-bold tracking-tight text-center text-white transition-all duration-300 transform",
                  greetingVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"
                )}
              >
                {greetings[greetingIndex].text}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-3 max-w-xs">
              Welcome to Cially! Let's get started!
            </p>

            <Button
              className="w-full text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md group mt-8 h-11"
              onClick={() => setStep(2)}
            >
              Get Started
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up py-6 flex flex-col gap-4">
            <CardHeader className="pb-0">
              <CardTitle className="text-center text-xl font-bold">
                What is Cially?
              </CardTitle>
              <CardDescription className="text-center text-xs text-muted-foreground/80">
                A self-hosted analytics platform to monitor, audit, and grow your Discord community.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-3.5 my-2">
                <div className="flex gap-3 items-start p-3 rounded-lg bg-white/5 border border-white/10 transition-all hover:bg-white/10">
                  <Bot className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm text-white">1. Discord Bot</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Actively captures server events, member actions, and message logs in real-time.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start p-3 rounded-lg bg-white/5 border border-white/10 transition-all hover:bg-white/10">
                  <Database className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm text-white">2. Pocketbase Database</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Securely indexes and stores all server logs inside a lightweight database.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start p-3 rounded-lg bg-white/5 border border-white/10 transition-all hover:bg-white/10">
                  <Activity className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm text-white">3. Web Dashboard</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Visualizes deep activity metrics, growth trends, and server insights beautifully.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3 mt-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button
                  className="flex-1 text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                  onClick={() => setStep(3)}
                >
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up py-6 flex flex-col gap-4">
            <CardHeader className="pb-0">
              <CardTitle className="text-center text-xl font-bold">
                Service Health Check
              </CardTitle>
              <CardDescription className="text-center text-xs">
                Verifying that Cially database and Discord configurations are responsive.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="space-y-4 my-2">
                {/* Pocketbase Card */}
                <Card className="border border-white/5 bg-white/4">
                  <CardHeader className="flex flex-row items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">Pocketbase</CardTitle>
                        <CardDescription className="text-xs">Primary Database</CardDescription>
                      </div>
                    </div>
                    <StatusBadge status={status.pocketbase} />
                  </CardHeader>
                </Card>

                {/* Bot Card */}
                <Card className="border border-white/5 bg-white/4">
                  <CardHeader className="flex flex-row items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                        <Rss className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">Discord Bot</CardTitle>
                        <CardDescription className="text-xs">Communication Service</CardDescription>
                      </div>
                    </div>
                    <StatusBadge status={status.bot} />
                  </CardHeader>
                </Card>

                {/* Discord API Card */}
                <Card className="border border-white/5 bg-white/4">
                  <CardHeader className="flex flex-row items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                        <Antenna className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">Discord API</CardTitle>
                        <CardDescription className="text-xs">External Dependency</CardDescription>
                      </div>
                    </div>
                    <StatusBadge status={status.discord} />
                  </CardHeader>
                </Card>
              </div>

              {(status.pocketbase === "offline" || status.bot === "offline" || status.discord === "offline") && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-2 items-start mt-2">
                  <AlertCircle className="size-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-300">
                    A service is unreachable. Ensure your Pocketbase server and Discord bot docker services are up before launching.
                  </p>
                </div>
              )}

              {error && <p className="text-rose-500 text-xs mt-1 text-center">{error}</p>}

              <div className="flex justify-between gap-3 mt-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button variant="outline" size="icon" onClick={checkServicesStatus} disabled={checkingStatus}>
                  <RefreshCw className={cn("size-4", checkingStatus && "animate-spin")} />
                </Button>
                <Button
                  className="flex-1 text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                  onClick={() => setStep(4)}
                >
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in-up py-6 flex flex-col gap-4">
            <CardHeader className="pb-0">
              <CardTitle className="text-center text-xl font-bold">Admin Email</CardTitle>
              <CardDescription className="text-center text-xs">
                Let's configure your administrator email.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-3 my-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id={emailID}
                    type="email"
                    placeholder="admin@example.com"
                    className="pl-10 h-11 bg-white/5"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    required
                  />
                </div>
                {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
              </div>

              <div className="flex justify-between gap-3 mt-2">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button
                  className="flex-1 text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                  onClick={() => {
                    if (!email.trim()) {
                      setError("Email is required");
                      return;
                    }
                    if (!/\S+@\S+\.\S+/.test(email)) {
                      setError("Please enter a valid email address");
                      return;
                    }
                    setError("");
                    setStep(5);
                  }}
                >
                  Next
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in-up py-6 flex flex-col gap-4">
            <CardHeader className="pb-0">
              <CardTitle className="text-center text-xl font-bold">Set Password</CardTitle>
              <CardDescription className="text-center text-xs">
                Create a secure password for server management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="space-y-4 my-2">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id={passwordID}
                        type="password"
                        minLength={8}
                        placeholder="••••••••"
                        className="pl-10 h-11 bg-white/5"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="passwordConfirm">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="passwordConfirm"
                        type="password"
                        minLength={8}
                        placeholder="••••••••"
                        className="pl-10 h-11 bg-white/5"
                        value={passwordConfirm}
                        onChange={(e) => {
                          setPasswordConfirm(e.target.value);
                          setError("");
                        }}
                        required
                      />
                    </div>
                  </div>

                  {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
                </div>

                <div className="flex justify-between gap-3 mt-2">
                  <Button variant="outline" onClick={() => setStep(4)} disabled={isLoading}>
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                  <Button
                    className="flex-1 text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </div>
        )}

        {step === 6 && (
          <div className="animate-fade-in-up py-6 flex flex-col gap-4">
            <CardHeader className="pb-0">
              <CardTitle className="text-center text-xl font-bold">All Set!</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 items-center">
              <p className="text-sm text-muted-foreground text-center">
                You have been logged in automatically. Click below to enter your community dashboard.
              </p>

              <Button
                className="w-full text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 mt-2 shadow-md"
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
              >
                Let's Get Started
              </Button>
            </CardContent>
          </div>
        )}
      </Card>
    </div>
  );
}
