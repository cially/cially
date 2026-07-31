"use client";

import { Antenna, CheckCircle2, Database, Rss, XCircle } from "lucide-react";
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
  const [statusData, setStatusData] = useState({
    pocketbase: "loading",
    bot: "loading",
    discord: "loading",
  });

  useEffect(() => {
    async function fetchData() {
      const chartDataReceived = await fetch("/api/cially/checkStatus");
      const json = await chartDataReceived.json();
      setStatusData(json);
      console.log(json);
    }
    fetchData();
  }, []);

  if (statusData.pocketbase !== "loading") {
    const botStatus = statusData.bot;
    const pbStatus = statusData.pocketbase;
    const discordStatus = statusData.discord;

    const StatusBadge = ({ status }: { status: string }) => {
      const isOnline = status === "online";
      return (
        <Badge
          className={`flex w-fit items-center gap-1.5 px-3 py-1 font-medium border-0 ${
            isOnline
              ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
              : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
          }`}
          variant="outline"
        >
          {isOnline ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {isOnline ? "Operational" : "Offline"}
        </Badge>
      );
    };

    return (
      <div className="min-h-dvh min-w-full ">
        <div>
          <div className="mt-4 ml-2 text-2xl">Status</div>
          <div className="mt-1 ml-2 text-sm text-white/50">
            Check if all the services are operating normally
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:mx-3 md:grid-cols-2">
          {/* Pocketbase Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Pocketbase</CardTitle>
                  <CardDescription>Primary Database</CardDescription>
                </div>
              </div>
              <StatusBadge status={pbStatus} />
            </CardHeader>
            <CardContent className="mt-4 border-t border-border/40 pt-4 text-sm text-muted-foreground">
              Handles all persistent data storage, including user authentication
              and server analytics.
            </CardContent>
          </Card>

          {/* Bot Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Rss className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Discord Bot</CardTitle>
                  <CardDescription>Communication Service</CardDescription>
                </div>
              </div>
              <StatusBadge status={botStatus} />
            </CardHeader>
            <CardContent className="mt-4 border-t border-border/40 pt-4 text-sm text-muted-foreground">
              The internal API and Discord Bot responsible for scraping and
              synchronizing server data.
            </CardContent>
          </Card>

          {/* Discord API Card (Full Width) */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Antenna className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Discord API</CardTitle>
                  <CardDescription>External Dependency</CardDescription>
                </div>
              </div>
              <StatusBadge status={discordStatus} />
            </CardHeader>
            <CardContent className="mt-4 border-t border-border/40 pt-4 text-sm text-muted-foreground">
              Real-time connectivity status pulled directly from the official
              Discord Status API.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSVG />
    </div>
  );
}
