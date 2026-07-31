"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ActiveChannels from "@/components/activity/active_channels";
import ActiveHours from "@/components/activity/active_hours";
import ActiveUsers from "@/components/activity/active_users";
import GeneralActivityData from "@/components/activity/general_data";
import GuildNotFound from "@/components/guildNotFound";
import ScrapeNotification from "@/components/scrapeNotification";

export default function MessagesDashboard() {
  return (
    <Suspense>
      <ClientComponent />
    </Suspense>
  );
}

interface ActivityData {
  notFound?: { errorCode: number }[];
  finalData?: {
    ChannelData: { channel: string; originalId: string; amount: number }[];
    ActiveUsersData: { author: string; originalId: string; amount: number }[];
    ActiveHourData: { hour: string; amount: number }[];
    GeneralData: { online: number; idle: number; offline: number; total: number }[];
  }[];
}

function ClientComponent() {
  const searchParams = useSearchParams();
  const guildID = searchParams.get("guildID");
  const [chartData, setChartData] = useState<ActivityData | null>(null);

  useEffect(() => {
    async function fetchData() {
      const chartDataReceived = await fetch(
        `/api/server/${guildID}/fetchActivityData`
      );
      const json = await chartDataReceived.json();
      setChartData(json);
      console.log(json);
    }
    fetchData();
  }, [guildID]);

  if (chartData?.notFound) {
    return <GuildNotFound />;
  }

  if (!chartData?.finalData) {
    return (
      <>
        <div className="mt-10 ml-10 text-2xl">Activity Analytics</div>
        <hr className="mt-2 mr-5 ml-5 w-50 sm:w-dvh" />

        <div className="mx-5 h-full">
          <div className="mt-10 grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <ActiveChannels />
            </div>
            <div>
              <ActiveUsers />
            </div>
          </div>

          <div className=" mt-5 w-full">
            <ActiveHours />

            <div className="mt-5">
              <GeneralActivityData />
            </div>
          </div>
        </div>

        <div className="mt-5 pb-5 text-center text-gray-600 text-xs">
          Thanks for using Cially Dashboard!
        </div>
      </>
    );
  }

  const data_channels = chartData?.finalData?.[0]?.ChannelData;
  const data_users = chartData?.finalData?.[0]?.ActiveUsersData;
  const data_hours = chartData?.finalData?.[0]?.ActiveHourData;
  const data_general = chartData?.finalData?.[0]?.GeneralData;

  return (
    <>
      <div className="mt-10 ml-10 text-2xl">Activity Analytics</div>
      <hr className="mt-2 mr-5 ml-5 w-50 sm:w-dvh" />
      <ScrapeNotification />
      <div className="mx-5 h-full">
        <div className="mt-10 grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <ActiveChannels chartData={data_channels} />
          </div>
          <div>
            <ActiveUsers chartData={data_users} />
          </div>
        </div>

        <div className="mt-5 w-full">
          <ActiveHours chartData={data_hours} />

          <div className="mt-5">
            <GeneralActivityData chartData={data_general} />
          </div>
        </div>
      </div>

      <div className="mt-5 pb-5 text-center text-gray-600 text-xs">
        Thanks for using Cially Dashboard!
      </div>
    </>
  );
}
