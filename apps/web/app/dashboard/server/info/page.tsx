"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import BottomCard from "@/components/info/bottom-card";
import MemberBlock from "@/components/info/member-card";
import MessagesBlock from "@/components/info/messages-card";
import { Skeleton } from "@/components/ui/skeleton";

interface GuildData {
  discordID: string;
  name: string;
  members: number;
  available: boolean;
  discord_partner: boolean;
  creation_date: string;
  channels: number;
  roles: number;
  bans: number;
  owner_username: string;
  icon_url: string | null;
  description: string | null;
  vanity_url: string | null;
  vanity_uses: number | null;
  today_msg: number;
  msg_day_difference: number;
}

function DashboardClientComponent() {
  const searchParams = useSearchParams();
  const guildID = searchParams.get("guildID");
  const [guildData, setGuildData] = useState<GuildData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const API_REQ = await fetch(`/api/server/${guildID}/fetchGuild`);
        if (!API_REQ.ok) {
          throw new Error(`Error fetching guild data: ${API_REQ.statusText}`);
        }
        const data = await API_REQ.json();

        if (await data.responseCode === 200) {
          setGuildData(data.guildData[0]);
        } else {
          throw new Error("Failed to fetch Guild Data from the API")
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    }

    if (guildID) {
      fetchData();
    }
  }, [guildID]);

  if (!guildData) {
    return (
      <div className="mt-10 mr-4 ml-10 grid grid-rows-3 sm:min-w-dvh sm:grid-rows-none">
        <div>
          <div className="rows-span-1 grid grid-rows-3 gap-y-3 sm:grid-cols-8 sm:grid-rows-none ">
            <div className="text-4xl sm:col-span-2 ">
              <Skeleton className="h-5 w-30" />
              <div className="mt-2 font-normal text-gray-400 text-xs">
                <Skeleton className="h-3 w-15" />
              </div>
            </div>
            <div className="mr-4 sm:col-span-2 sm:col-start-4">
              <Skeleton className="h-25 w-50 rounded-2xl" />
            </div>
            <div className="mr-4 sm:col-span-2 sm:col-start-6">
              <Skeleton className="h-25 w-50 rounded-2xl" />
            </div>
          </div>
        </div>

        <div className="row-span-3 sm:row-span-1">
          <Skeleton className="mt-30 h-25 w-full place-self-center rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!guildData) {
    return <div>No guild data found.</div>;
  }

  const date = new Date();
  const new_date = date.toLocaleString("en-US");
  const welcome_message = String(new_date).includes("AM")
    ? "Good Morning"
    : "Good Evening";

  return (
    <div className="mx-0 mt-10 grid grid-rows-3 sm:mx-5 sm:min-w-dvh sm:grid-rows-none">
      <div>
        <div className="rows-span-1 grid grid-rows-3 sm:grid-cols-8 sm:grid-rows-none ">
          <div className="text-4xl sm:col-span-2 ">
            {welcome_message}
            <div className="mt-2 font-normal text-gray-400 text-xs">
              Currently viewing {guildData.name}
            </div>
          </div>
          <div className="mr-0 sm:col-span-2 sm:col-start-5 sm:mr-4">
            <MemberBlock guild={guildData} />
          </div>
          <div className="mr-0 sm:col-span-2 sm:col-start-7 sm:mr-4">
            <MessagesBlock guild={guildData} />
          </div>
        </div>
      </div>

      <div className="row-span-3 sm:row-span-1">
        <BottomCard guild={guildData} />
        <div className="mt-5 pb-5 text-center text-gray-600 text-xs">
          Thanks for using Cially Dashboard!
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense>
      <DashboardClientComponent />
    </Suspense>
  );
}
