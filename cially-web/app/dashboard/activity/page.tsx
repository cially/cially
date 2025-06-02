"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import GuildNotFound from "@/app/_components/_events/guildNotFound";
import ActiveChannels from "../activity/_components/active_channels";
import ActiveHours from "../activity/_components/active_hours";
import ActiveUsers from "../activity/_components/active_users";
import GeneralActivityData from "./_components/general_data";

import { Suspense } from "react";
import ScrapeNotification from "@/app/_components/_notifications/scrapeNotification";

export default function MessagesDashboard() {
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
        `/api/server/${guildID}/fetchActivityData`
      );
      const json = await chartDataReceived.json();
      setChartData(json);
      console.log(json);
    }
    fetchData();
  }, [guildID]);

  if (chartData.notFound) {
    return <GuildNotFound />;
  }

  if (!chartData.finalData) {
    return (
      <>
        <div className="mt-10 ml-10 text-2xl">Activity Analytics</div>
        <hr className="mt-2 mr-5 ml-5 w-50 sm:w-dvh" />

        <div className="h-[100%] mx-5">
          <div className="grid grid-cols-1 w-[100%] sm:grid-cols-2 mt-10 gap-5">
            <div>
              <ActiveChannels />
            </div>
            <div>
              <ActiveUsers />
            </div>
          </div>

          <div className=" mt-5 w-[100%]">
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

  const data_channels = chartData.finalData[0].ChannelData;
  const data_users = chartData.finalData[0].ActiveUsersData;
  const data_hours = chartData.finalData[0].ActiveHourData;
  const data_general = chartData.finalData[0].GeneralData;

  return (
    <>
      <div className="mt-10 ml-10 text-2xl">Activity Analytics</div>
      <hr className="mt-2 mr-5 ml-5 w-50 sm:w-dvh" />
      <ScrapeNotification />
      <div className="h-[100%] mx-5">
        <div className="grid grid-cols-1 w-[100%] sm:grid-cols-2 mt-10 gap-5">
          <div>
            <ActiveChannels chartData={data_channels} />
          </div>
          <div>
            <ActiveUsers chartData={data_users} />
          </div>
        </div>

        <div className=" mt-5 w-[100%]">
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
