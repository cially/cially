"use client";

import { useRouter } from "next/navigation";
import PocketBase from "pocketbase";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export default function GuestLogin() {
  const router = useRouter();
  const [guestStatus, setGuestStatus] = useState(false);
  const [pocketbaseUrl, setPocketbaseUrl] = useState("");

  // Initialize PocketBase client with the fetched URL
  const pb = useMemo(() => {
    if (pocketbaseUrl) {
      return new PocketBase(pocketbaseUrl);
    }
    return null;
  }, [pocketbaseUrl]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch both PocketBase config and guest status
        const [configResponse, guestResponse] = await Promise.all([
          fetch("/api/cially/pocketbaseURL"),
          fetch("/api/cially/checkForGuestAccount"),
        ]);

        const config = await configResponse.json();
        const guestData = await guestResponse.json();

        setPocketbaseUrl(config.url);

        if (guestData?.account) {
          setGuestStatus(true);
        } else {
          setGuestStatus(false);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setGuestStatus(false);
      }
    }

    fetchData();
  }, []);

  async function handleGuestLogin() {
    if (!pb) {
      console.error("PocketBase client not initialized");
      return;
    }

    try {
      await pb
        .collection("users")
        .authWithPassword(
          "cially-guest@do-not-create-an-admin-account-with-this-address-manually.it-will-break-things.com",
          "do-not-create-an-admin-account-with-this-address"
        );

      const cookieStr = pb.authStore.exportToCookie({ httpOnly: false });
      document.cookie = cookieStr;

      // redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
    }
  }

  if (guestStatus === true && pb) {
    return (
      <Button onClick={handleGuestLogin} variant={"ghost"}>
        Login as a Guest
      </Button>
    );
  }

  return null;
}
