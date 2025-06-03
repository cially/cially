"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import GuildNotFound from "@/app/_components/_events/guildNotFound";
import GeneralMessageDataCard from "./_components/_message-charts/general_data";
import Last4Weeks from "./_components/_message-charts/last_4weeks";
import Last7d from "./_components/_message-charts/last_7d";
import Last24h from "./_components/_message-charts/last_24hrs";
import ScrapeNotification from "@/app/_components/_notifications/scrapeNotification";
import { TotalStatsGraph } from "./_components/_message-charts/total_stats_graph";

export default function GrowthPage() {
  return (
    <Suspense>
      <ClientComponent />
    </Suspense>
  );
}

function ClientComponent() {
  const searchParams = useSearchParams();
  const guildID = searchParams.get("guildID");
  const [chartData, setChartData] = useState([{ amount: 69 }]);

  useEffect(() => {
    async function fetchData() {
      const chartDataReceived = await fetch(
        `/api/server/${guildID}/fetchGrowthData`
      );
      const json = await chartDataReceived.json();
      setChartData(json);
    }
    fetchData();
  }, [guildID]);

  if (chartData.notFound) {
    return <GuildNotFound />;
  }
  if (!chartData.finalData) {
    return (
      <>
        <div className="mt-10 ml-10 text-2xl">Growth Analytics</div>
        <hr className="mt-2 mr-5 ml-5 w-50 sm:w-dvh" />

        <div className="mt-10 grid max-w-100 grid-rows-3 gap-y-4 sm:mx-5 sm:max-w-full sm:grid-cols-3 sm:grid-rows-none sm:gap-x-3 sm:gap-y-0">
          <Last24h />
          <Last7d />
          <Last4Weeks />
        </div>

        <div className="sm:mx-5">
          <GeneralMessageDataCard />
        </div>

        <div className="mt-5 pb-5 text-center text-gray-600 text-xs">
          Thanks for using Cially Dashboard!
        </div>
      </>
    );
  }

  const data_24h = chartData.finalData[0].HourData;
  const data_7d = chartData.finalData[0].WeekData;
  const data_4w = chartData.finalData[0].FourWeekData;
  const data_general = chartData.finalData[0].GeneralData;
  const data_hourly = chartData.finalData[0].HourlyTotals;
  return (
    <>
      <div className="mt-10 ml-10 text-2xl">Growth Analytics</div>
      <hr className="mt-2 mr-5 ml-5 w-50 sm:w-dvh" />

      <ScrapeNotification />

      <div className="mt-10 grid max-w-100 grid-rows-3 gap-y-4 sm:mx-5 sm:max-w-full sm:grid-cols-3 sm:grid-rows-none sm:gap-x-3 sm:gap-y-0">
        <Last24h chartData={data_24h} />
        <Last7d chartData={data_7d} />
        <Last4Weeks chartData={data_4w} />
      </div>

      <div className="sm:ml-5 sm:mr-5 mt-5">
        <TotalStatsGraph chartData={data_hourly} />
      </div>

      <div className="sm:ml-5 sm:mr-5">
        <GeneralMessageDataCard generalData={data_general} />
      </div>

      <div className="mt-5 pb-5 text-center text-gray-600 text-xs">
        Thanks for using Cially Dashboard!
      </div>
    </>
  );
}
