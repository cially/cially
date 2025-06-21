"use client";
import { ShieldUser } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function GuestToggle({ isGuest, onToggle, setGuest }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/cially/toggleGuestStatus", {
        method: "POST",
      });
      if (response.ok) {
        setGuest((prev) => {
          if (prev?.account) {
            return { noAccounts: true };
          } else if (prev?.noAccounts) {
            return { account: true };
          } else {
            return prev;
          }
        });
        onToggle?.();
      }
    } catch (error) {
      console.error("Toggle failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (isGuest?.account) {
    return (
      <div className="place-self-center">
        <Button variant="outline" onClick={handleToggle} disabled={loading}>
          {loading ? "Processing..." : "Make Private"}
        </Button>
      </div>
    );
  } else if (isGuest?.noAccounts) {
    return (
      <div className="place-self-center">
        <Button variant="outline" onClick={handleToggle} disabled={loading}>
          {loading ? "Processing..." : "Make Public"}
        </Button>
      </div>
    );
  } else {
    return <div className="text-center text-sm text-gray-500">Loading...</div>;
  }
}

export default function GuestToggleCard() {
  const [isGuest, setGuest] = useState(null);
  const [refreshToggle, setRefreshToggle] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/cially/checkForGuestAccount");
      const data = await response.json();
      setGuest(data);
    }
    fetchData();
  }, [refreshToggle]);

  const triggerRefresh = () => {
    setRefreshToggle((prev) => !prev);
  };

  return (
    <Card className="mt-7 mx-3">
      <CardHeader>
        <CardTitle>
          <ShieldUser className="inline w-5 mr-2 -translate-y-0.5" /> Dashboard
          Privacy
        </CardTitle>
        <CardDescription>
          By allowing guests, any user can access the stats of your servers
          without having to login. Guests are not allowed to make changes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GuestToggle
          isGuest={isGuest}
          onToggle={triggerRefresh}
          setGuest={setGuest}
        />
      </CardContent>
    </Card>
  );
}
