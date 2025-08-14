"use client";

import { redirect, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import GuildNotFound from "@/components/guildNotFound";
import LoadingSVG from "@/components/loading-page";

function ClientComponent() {
  const searchParams = useSearchParams();
  const guildID = searchParams.get("guildID");
  const [serverData, setChartData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const chartDataReceived = await fetch(
        `/api/server/${guildID}/fetchGuild`
      );
      const json = await chartDataReceived.json();
      setChartData(json);
    }
    fetchData();
  }, [guildID]);

  if (serverData?.notFound) {
    return <GuildNotFound />;
  }
  if (serverData?.guildFound) {
    redirect(`server/info?guildID=${guildID}`);
  } else {
    return <LoadingSVG />;
  }
}

export default function DataDashboard() {
  return (
    <Suspense fallback={<LoadingSVG />}>
      <ClientComponent />
    </Suspense>
  );
}
