"use client";

import { Antenna, CheckCircle, Database, Rss, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import GuildNotFound from "@/components/guildNotFound";
import LoadingSVG from "@/components/loading-page";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Status() {
  const [statusData, setStatusData] = useState([{ amount: 69 }]);

  useEffect(() => {
    async function fetchData() {
      const chartDataReceived = await fetch("/api/cially/checkStatus");
      const json = await chartDataReceived.json();
      setStatusData(json);
      console.log(json);
    }
    fetchData();
  }, []);

  if (statusData.pocketbase) {
    return <GuildNotFound />;
  }
  if (statusData[0].pocketbase) {
    const botStatus = statusData[1].bot;
    const pbStatus = statusData[0].pocketbase;
    const discordStatus = statusData[2].discord;

    return (
      <>
        <div>
          <div className="mt-4 ml-2 text-2xl">Status</div>
          <div className="mt-1 ml-2 text-sm text-white/50">
            Check if all the services are operating normally
          </div>
        </div>
        <div className="mt-8 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <div className="mr-3 rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Pocketbase</CardTitle>
                  <CardDescription>Database Service</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <Badge
                  className={
                    pbStatus === "online"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }
                  variant={pbStatus === "online" ? "default" : "destructive"}
                >
                  <div className="flex items-center">
                    {pbStatus === "online" ? (
                      <CheckCircle className="mr-1 h-4 w-4" />
                    ) : (
                      <XCircle className="mr-1 h-4 w-4" />
                    )}
                    {pbStatus === "online" ? "Online" : "Offline"}
                  </div>
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <div className="mr-3 rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                  <Rss className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Bot & API #2</CardTitle>
                  <CardDescription>Communication Service</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <Badge
                  className={
                    botStatus === "online"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }
                  variant={botStatus === "online" ? "default" : "destructive"}
                >
                  <div className="flex items-center">
                    {botStatus === "online" ? (
                      <CheckCircle className="mr-1 h-4 w-4" />
                    ) : (
                      <XCircle className="mr-1 h-4 w-4" />
                    )}
                    {botStatus === "online" ? "Online" : "Offline"}
                  </div>
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-md sm:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <div className="mr-3 rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                  <Antenna className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Discord API</CardTitle>
                  <CardDescription>
                    Real-time status pulled directly from the official Discord
                    Status API
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <Badge
                  className={
                    discordStatus === "online"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }
                  variant={
                    discordStatus === "online" ? "default" : "destructive"
                  }
                >
                  <div className="flex items-center">
                    {discordStatus === "online" ? (
                      <CheckCircle className="mr-1 h-4 w-4" />
                    ) : (
                      <XCircle className="mr-1 h-4 w-4" />
                    )}
                    {discordStatus === "online" ? "Online" : "Offline"}
                  </div>
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }
  return (
    <div className="place-self-center">
      <LoadingSVG />
    </div>
  );
}
