"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import ScrapeNotification from "@/components/scrapeNotification";
import { agentsExist } from "@/components/agent/agentManager";
import SetupAgents from "@/components/agent/SetupAgent";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import AgentChat from "@/components/agent/ChatPanel";

export default function AgentsPage() {
  return (
    <Suspense>
      <ClientComponent />
    </Suspense>
  );
}

function ClientComponent() {
  const searchParams = useSearchParams();
  const [doAgentsExist, setDoAgentsExist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const guildID = searchParams.get("guildID");

  const checkAgents = async () => {
    setIsLoading(true);
    setDoAgentsExist(await agentsExist());
    setIsLoading(false);
  };

  useEffect(() => {
    checkAgents();
  }, [])

  function Header() {
    return (
      <>
        <div className="mt-10 ml-10 text-2xl">Agent</div>
        <div className=" ml-10 text-sm text-white/50">
          Ask your AI Agent questions regarding your Discord Server.
        </div>
        <hr className="mt-2 mr-5 ml-5 w-50 sm:w-dvh" />

        <div className="mx-5 mt-5">
          {isLoading ? (
            <Card className="mt-10 grid auto-rows-auto px-10 py-6 sm:min-w-dvh">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <div className="mt-4 flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="mt-2 h-10 w-full" />
                </div>
              </div>
            </Card>
          ) : doAgentsExist ? (
            <AgentChat />
          ) : (
            <SetupAgents onComplete={checkAgents} />
          )
          }
        </div>
        <ScrapeNotification />
      </>
    );
  }


  return (
    <>
      <Header />
    </>
  );
}
