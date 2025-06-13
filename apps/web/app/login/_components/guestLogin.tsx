"use client";

import { useRouter } from "next/navigation";
import PocketBase from "pocketbase";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// initialize PocketBase client
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function fetchGuestStatus(setGuestStatus) {
  useEffect(() => {
    async function sendRequest() {
      const response = await fetch("api/cially/checkForGuestAccount");
      const body = await response.json();
      if (body?.account) {
        setGuestStatus(true);
      } else {
        setGuestStatus(false);
      }
    }
    sendRequest();
  }, [setGuestStatus]);
}

async function handleGuestLogin(router) {
  try {
    await pb
      .collection("users")
      .authWithPassword(
        "cially-guest@do-not-create-an-admin-account-with-this-address-manually.it-will-break-things.com",
        "do-not-create-an-admin-account-with-this-address",
      );

    const cookieStr = pb.authStore.exportToCookie({ httpOnly: false });
    document.cookie = cookieStr;

    // redirect to dashboard
    router.push("/dashboard");
  } catch (err: any) {
    console.error("Login failed:", err);
  }
}

export default function GuestLogin() {
  const router = useRouter();
  const [guestStatus, setGuestStatus] = useState(false);

  fetchGuestStatus(setGuestStatus);

  if (guestStatus === true) {
    return (
      <>
        <Button variant={"ghost"} onClick={() => handleGuestLogin(router)}>
          Login as a Guest
        </Button>
      </>
    );
  }
}
