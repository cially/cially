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
      const { toggleGuestStatusAction } =
        await import("@/components/actions/toggleGuestStatus");
      const result = await toggleGuestStatusAction();
      if (result && !result.error) {
        setGuest((prev) => {
          if (prev?.account) {
            return { noAccounts: true };
          }
          if (prev?.noAccounts) {
            return { account: true };
          }
          return prev;
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
        <Button
          className="hover:cursor-pointer"
          disabled={loading}
          onClick={handleToggle}
          variant="outline"
        >
          {loading ? "Processing..." : "Make Private"}
        </Button>
      </div>
    );
  }
  if (isGuest?.noAccounts) {
    return (
      <div className="place-self-center">
        <Button
          className="hover:cursor-pointer"
          disabled={loading}
          onClick={handleToggle}
          variant="outline"
        >
          {loading ? "Processing..." : "Make Public"}
        </Button>
      </div>
    );
  }
  return <div className="text-center text-gray-500 text-sm">Loading...</div>;
}

export default function GuestToggleCard() {
  const [isGuest, setGuest] = useState(null);
  const [_refreshToggle, setRefreshToggle] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { checkForGuestAccountAction } =
        await import("@/components/actions/checkForGuestAccount");
      const data = await checkForGuestAccountAction();
      setGuest(data);
    }
    fetchData();
  }, []);

  const triggerRefresh = () => {
    setRefreshToggle((prev) => !prev);
  };

  return (
    <Card className="mx-3 mt-7 flex flex-col">
      <CardHeader>
        <CardTitle>
          <ShieldUser className="-translate-y-0.5 mr-2 inline w-5" /> Dashboard
          Privacy
        </CardTitle>
        <CardDescription>
          By allowing guests, any user can access the stats of your servers
          without having to login. Guests are not allowed to make changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex justify-center pb-0">
        <GuestToggle
          isGuest={isGuest}
          onToggle={triggerRefresh}
          setGuest={setGuest}
        />
      </CardContent>
    </Card>
  );
}
