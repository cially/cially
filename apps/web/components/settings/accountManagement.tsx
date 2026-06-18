// biome-ignore lint/style/useFilenamingConvention: naming convention
"use client";

import {
  Key,
  Loader2,
  Mail,
  Plus,
  ShieldAlert,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createAdminAccount,
  deleteAdminAccount,
  fetchAdminAccounts,
} from "@/app/dashboard/cially/settings/_logic/adminAccountManager";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AdminAccount {
  admin: boolean;
  email: string;
  id: string;
  name?: string;
}

interface AdminAccountsResponse {
  adminAccounts: AdminAccount[];
  adminAccountsLength: number;
  currentAdminId?: string;
}

const UPPER_CASE_REGEX = /[A-Z]/;
const LOWER_CASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /[0-9]/;
const SYMBOL_REGEX = /[^A-Za-z0-9]/;

const getAvatarGradient = (email: string) => {
  const gradients = [
    "from-blue-600 to-indigo-700",
    "from-emerald-500 to-teal-700",
    "from-violet-600 to-purple-800",
    "from-pink-500 to-rose-700",
    "from-orange-500 to-amber-600",
    "from-cyan-500 to-blue-700",
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + hash * 33;
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export default function AccountManagementCard() {
  const [adminAccounts, setAdminAccounts] = useState<AdminAccountsResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const getPasswordStrength = (pass: string) => {
    if (!pass) {
      return {
        score: 0,
        label: "Empty",
        color: "bg-muted",
        criteria: {
          minLength: false,
          upperLower: false,
          number: false,
          symbol: false,
        },
      };
    }
    let score = 0;

    const hasMinLength = pass.length >= 8;
    const hasUpperCase = UPPER_CASE_REGEX.test(pass);
    const hasLowerCase = LOWER_CASE_REGEX.test(pass);
    const hasNumber = NUMBER_REGEX.test(pass);
    const hasSymbol = SYMBOL_REGEX.test(pass);

    if (hasMinLength) {
      score += 1;
    }
    if (hasUpperCase && hasLowerCase) {
      score += 1;
    }
    if (hasNumber) {
      score += 1;
    }
    if (hasSymbol) {
      score += 1;
    }

    let label = "Very Weak";
    let color = "bg-red-500";
    if (score === 2) {
      label = "Fair";
      color = "bg-orange-500";
    } else if (score === 3) {
      label = "Strong";
      color = "bg-yellow-500";
    } else if (score === 4) {
      label = "Very Strong";
      color = "bg-green-500";
    }

    return {
      score,
      label,
      color,
      criteria: {
        minLength: hasMinLength,
        upperLower: hasUpperCase && hasLowerCase,
        number: hasNumber,
        symbol: hasSymbol,
      },
    };
  };

  const passwordStrength = getPasswordStrength(password);
  const isPasswordValid = passwordStrength.criteria.minLength;

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminAccounts();
      if (data) {
        if ("error" in data) {
          toast.error(data.message || "Failed to fetch admin accounts");
        } else {
          setAdminAccounts(data as AdminAccountsResponse);
        }
      } else {
        toast.error("Failed to fetch admin accounts");
      }
    } catch {
      toast.error("Failed to fetch admin accounts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteAdminAccount(id);
      if (result?.responseCode === 200) {
        toast.success(result.message);
        fetchAccounts();
      } else {
        toast.error(result?.message || "Failed to delete account");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    setIsCreating(true);
    try {
      const result = await createAdminAccount(name, email, password);
      if (result?.responseCode === 200) {
        toast.success(result.message);
        setOpen(false);
        setName("");
        setEmail("");
        setPassword("");
        fetchAccounts();
      } else {
        toast.error(result?.message || "Failed to create account");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="animate-pulse text-muted-foreground text-sm">
          Loading administrator accounts...
        </p>
      </div>
    );
  } else if (
    adminAccounts?.adminAccounts &&
    adminAccounts.adminAccounts.length > 0
  ) {
    content = (
      <div className="grid gap-4">
        {adminAccounts.adminAccounts.map((account) => (
          <div
            className="flex items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10"
            key={account.id}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-base text-white uppercase shadow-inner ${getAvatarGradient(
                  account.email,
                )}`}
              >
                {(account.name || account.email).charAt(0)}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  {account.name || "Administrator"}
                  {account.id === adminAccounts.currentAdminId && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 font-semibold text-[10px] text-white tracking-wider">
                      You
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground text-sm">
                  {account.email}
                </span>
              </div>
            </div>

            {account.id === adminAccounts.currentAdminId ? (
              <span className="rounded-md bg-white/10 px-2.5 py-1 font-medium text-white text-xs">
                Current Session
              </span>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="rounded-full text-white hover:text-red-600 transition-all bg-transparent hover:bg-transparent"
                    disabled={isDeleting === account.id}
                    size="icon"
                  >
                    {isDeleting === account.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white/3 backdrop-blur-lg border-0">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-white">
                      <ShieldAlert className="h-5 w-5" /> Delete Admin Account
                    </AlertDialogTitle>
                    <AlertDialogDescription className="pt-2 text-base">
                      Are you sure you want to delete the administrator account
                      for{" "}
                      <span className="font-bold text-foreground">
                        {account.email}
                      </span>
                      ? This will immediately revoke their access.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel className="rounded-lg">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-lg bg-destructive px-6 text-white hover:bg-destructive/90"
                      onClick={() => handleDelete(account.id)}
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        ))}
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">No admin accounts found</h3>
        <p className="mt-1 max-w-[250px] text-muted-foreground text-sm">
          It seems there are no administrator accounts configured yet.
        </p>
        <Button
          className="mt-6"
          onClick={() => setOpen(true)}
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" /> Add First Admin
        </Button>
      </div>
    );
  }

  return (
    <Card className="mx-3 mt-7 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl">
            <User className="mr-2 inline w-5 -translate-y-0.5" /> Account
            Management
          </CardTitle>
          <CardDescription>
            Manage administrator accounts. These accounts have full access to
            the dashboard and database.
          </CardDescription>
        </div>
        <Sheet onOpenChange={setOpen} open={open}>
          <SheetTrigger asChild>
            <Button className="h-9 px-4" size="sm" variant="outline">
              <Plus className="h-4 w-4" />
              New Account
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-white/5 p-5 backdrop-blur-lg">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl">Add Admin Account</SheetTitle>
              <SheetDescription>
                Create a new administrator account with full privileges.
              </SheetDescription>
            </SheetHeader>
            <form className="space-y-6" onSubmit={handleCreate}>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserPlus className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    id="name"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    value={name}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Key className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    id="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    type="password"
                    value={password}
                  />
                </div>
                {password && (
                  <div className="space-y-2 pt-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Password strength:
                      </span>
                      <span className="font-semibold text-white">
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid h-1.5 grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4].map((step) => {
                        const isActive = passwordStrength.score >= step;
                        return (
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isActive ? passwordStrength.color : "bg-white/10"
                            }`}
                            key={step}
                          />
                        );
                      })}
                    </div>
                    <ul className="space-y-1 pt-1 text-muted-foreground text-xs">
                      <li className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            passwordStrength.criteria.minLength
                              ? "bg-green-500"
                              : "bg-white/10"
                          }`}
                        />
                        At least 8 characters
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            passwordStrength.criteria.upperLower
                              ? "bg-green-500"
                              : "bg-white/10"
                          }`}
                        />
                        Uppercase & lowercase letters
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            passwordStrength.criteria.number
                              ? "bg-green-500"
                              : "bg-white/10"
                          }`}
                        />
                        At least one number
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            passwordStrength.criteria.symbol
                              ? "bg-green-500"
                              : "bg-white/10"
                          }`}
                        />
                        At least one special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="pt-4">
                <Button
                  className="w-full"
                  disabled={
                    isCreating || (password.length > 0 && !isPasswordValid)
                  }
                  type="submit"
                  variant="outline"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent className="mt-4">{content}</CardContent>
    </Card>
  );
}
