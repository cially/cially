"use client";

import { Activity, Settings } from "lucide-react";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function MessagesDashboard() {
  return (
    <Suspense>
      <ClientComponent />
    </Suspense>
  );
}

interface GuildData {
  AvailableGuilds: Array<Guild> | null,
  responseCode: number
}

interface Guild {
  name: string
  id: number
  icon: string,
  in_db: boolean
}

function ClientComponent() {
  const [guildData, setGuildData] = useState<GuildData>();

  useEffect(() => {
    async function fetchData() {
      const DataReceived = await fetch("/api/fetchGuilds");
      const json = await DataReceived.json();
      setGuildData(json.data);
      console.log(json);
    }
    fetchData();
  }, []);

  try {
    if (!guildData?.AvailableGuilds) {
      return (
        <>
          <div className="w-20 place-self-center">
            <Image
              alt="logo"
              fetchPriority="high"
              height={500}
              priority={true}
              src="/logo-webp.webp"
              width={500}
            />
          </div>
          <div className="text-center text-2xl">Available Guilds</div>
          <div className="text-center text-gray-400 text-sm">
            Please Select the Guild you would like to view
          </div>
          <div className="mb-10" />

          <div className="mx-10 grid grid-cols-1 gap-y-5 sm:grid-cols-3">
            <Skeleton className="h-37.5 w-62.5 place-self-center rounded-xl" />
            <Skeleton className="h-37.5 w-62.5 place-self-center rounded-xl" />
            <Skeleton className="h-37.5 w-62.5 place-self-center rounded-xl" />
          </div>

          <div className="mt-10 self-center">
            <div className="mt-10 grid grid-cols-3 gap-x-5 place-self-center text-gray-400 ">
              <div className="w-6 rounded-full ">
                <a href="/dashboard/cially/settings">
                  <Settings className="w-7 place-self-center transition-all hover:text-gray-600" />
                </a>
              </div>

              <div className="w-6 rounded-full">
                <a href="/dashboard/cially/status">
                  <Activity className="w-7 place-self-center transition-all hover:text-gray-600" />
                </a>
              </div>

              <div className="w-6 rounded-full">
                <a href="https://github.com/cially/cially">
                  <Image
                    alt="github"
                    className="w-7 place-self-center brightness-[1] grayscale-0 transition-all hover:brightness-[0.55]"
                    height={500}
                    src="/github.svg"
                    width={500}
                  />
                </a>
              </div>
            </div>
            <div className="mt-5 pb-5 text-center text-gray-600 text-xs">
              Thanks for using Cially Dashboard!
            </div>
          </div>
        </>
      );
    }

    const guildDataArray = guildData.AvailableGuilds;
    const guildLength = guildDataArray.length;
    const grid_column_number = guildLength > 2 ? 3 : guildLength > 1 ? 2 : 1;
    const gridClass = {
      1: "sm:grid-cols-1",
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-3",
    }[grid_column_number];

    const guildCards = guildDataArray.map((guild) =>
      guild.in_db === true ? (
        <a href={`/dashboard/fetchGuild?guildID=${guild.id}`} key={guild.id}>
          <Card className="transition-all hover:bg-white/2 sm:mx-5 ">
            <CardHeader className="place-items-center">
              <Avatar className=" h-20 w-20">
                <AvatarImage src={guild.icon} />
                <AvatarFallback>Guild</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-5 text-center">{guild.name}</CardTitle>
            </CardHeader>
          </Card>
        </a>
      ) : (
        <TooltipProvider key={guild.id}>
          <Tooltip>
            <TooltipTrigger>
              <Card className="cursor-not-allowed bg-red-400/10 transition-all hover:bg-red-400/7 sm:mx-5">
                <CardHeader className="place-items-center">
                  <Avatar className=" h-20 w-20">
                    <AvatarImage src={guild.icon} />
                    <AvatarFallback>Guild</AvatarFallback>
                  </Avatar>
                  <CardTitle className="mt-5">{guild.name}</CardTitle>
                </CardHeader>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="text-white">
              <p>
                There is not enough data for this server! Please let the bot
                fetch some data and try again later!
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    );

    return (
      <>
        <div className="w-20 place-self-center">
          <Image
            alt="logo"
            fetchPriority="high"
            height={500}
            priority={true}
            src="/logo-webp.webp"
            width={500}
          />
        </div>
        <div className="text-center text-2xl">Available Guilds</div>
        <div className="text-center text-gray-400 text-sm">
          Please Select the Guild you would like to view
        </div>

        <div className="mb-10" />
        <div className={`grid grid-cols-1 gap-y-5 ${gridClass} sm:mx-10`}>
          {guildCards}
        </div>

        <div className="mt-10 self-center">
          <div className="mt-10 grid grid-cols-3 gap-x-5 place-self-center text-gray-400 ">
            <div className="w-6 rounded-full ">
              <a href="/dashboard/cially/settings">
                <Settings className="w-7 place-self-center transition-all hover:text-gray-600" />
              </a>
            </div>

            <div className="w-6 rounded-full">
              <a href="/dashboard/cially/status">
                <Activity className="w-7 place-self-center transition-all hover:text-gray-600" />
              </a>
            </div>

            <div className="w-6 rounded-full">
              <a href="https://github.com/cially/cially">
                <Image
                  alt="github"
                  className="w-7 place-self-center brightness-[1] grayscale-0 transition-all hover:brightness-[0.55]"
                  height={500}
                  src="/github.svg"
                  width={500}
                />
              </a>
            </div>
          </div>
          <div className="mt-5 pb-5 text-center text-gray-600 text-xs">
            Thanks for using Cially Dashboard!
          </div>
        </div>
      </>
    );
  } catch (err: any) {
    const error = err.toString();
    console.log(err);
    return (
      <>
        <div className="w-20 place-self-center">
          <Image
            alt="logo"
            fetchPriority="high"
            height={500}
            priority={true}
            src="/logo-webp.webp"
            width={500}
          />
        </div>
        <div className="mx-5 text-center">
          Looks like the Discord Bot can't communicate with the Dashboard.
          <br />
          Please make sure that you followed the setup instructions correctly
          and that the bot is up and running!
          <br />
          <br />
          Are you facing other issues? Check our GitHub and seek support!
          <br />
          <a
            className="text-blue-400 underline"
            href="https://github.com/skellgreco/cially"
          >
            GitHub Redirect
          </a>
          <br />
          <br />
          <div>Error {err.name}</div>
          <div>{error}</div>
        </div>
        <div className="mt-10 self-center">
          <div className="mt-10 grid grid-cols-3 gap-x-5 place-self-center text-gray-400 ">
            <div className="w-6 rounded-full ">
              <a href="/dashboard/cially/settings">
                <Settings className="w-7 place-self-center transition-all hover:text-gray-600" />
              </a>
            </div>

            <div className="w-6 rounded-full">
              <a href="/dashboard/cially/status">
                <Activity className="w-7 place-self-center transition-all hover:text-gray-600" />
              </a>
            </div>

            <div className="w-6 rounded-full">
              <a href="https://github.com/cially/cially">
                <Image
                  alt="github"
                  className="w-7 place-self-center brightness-[1] grayscale-0 transition-all hover:brightness-[0.55]"
                  height={500}
                  src="/github.svg"
                  width={500}
                />
              </a>
            </div>
          </div>
          <div className="mt-5 pb-5 text-center text-gray-600 text-xs">
            Thanks for using Cially Dashboard!
          </div>
        </div>
      </>
    );
  }
}
