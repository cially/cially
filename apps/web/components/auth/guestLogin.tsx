"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function GuestLogin() {
  const router = useRouter();
  const [guestStatus, setGuestStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { checkForGuestAccountAction } = await import("@/components/actions/checkForGuestAccount");
        const guestData = await checkForGuestAccountAction();

        if (guestData?.account) {
          setGuestStatus(true);
        } else {
          setGuestStatus(false);
        }
      } catch (error) {
        console.error("Failed to fetch guest status:", error);
        setGuestStatus(false);
      }
    }

    fetchData();
  }, []);

  async function handleGuestLogin() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cially/auth/guest", {
        method: "POST",
      });

      if (response.ok) {
        // redirect to dashboard
        router.push("/dashboard");
      } else {
        const data = await response.json();
        console.error("Guest login failed:", data.error);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  }

  if (guestStatus === true) {
    return (
      <Button disabled={isLoading} onClick={handleGuestLogin} variant={"ghost"}>
        {isLoading ? "Logging in..." : "Login as a Guest"}
      </Button>
    );
  }

  return null;
}
