"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ActiveChannels from "@/components/voice/active_channels";
import ActiveUsers from "@/components/voice/active_users";
import Last24h from "@/components/voice/last_24hrs";
import Last7d from "@/components/voice/last_7d";
import Last4Weeks from "@/components/voice/last_4weeks";
import GeneralVoiceData from "@/components/voice/general_data";
import GuildNotFound from "@/components/guildNotFound";
import ScrapeNotification from "@/components/scrapeNotification";

export default function VoiceDashboardPage() {
  return (
    <Suspense>
      <ClientComponent />
    </Suspense>
  );
}

interface VoiceDataResponse {
  notFound?: { errorCode: number }[];
  serverError?: { errorCode: number }[];
  finalData?: {
    ChannelData: { channel: string; originalId: string; amount: number }[];
    ActiveUsersData: { author: string; originalId: string; amount: number }[];
    HourData: { hour: string; joins: number; leaves: number; unique_users: number }[];
    WeekData: { date: string; joins: number; leaves: number; unique_users: number }[];
    FourWeekData: {
      factor: string;
      starting_date: { startingDate_formatted: string; startingDate_ms: number };
      finishing_date: { endingDate_formatted: string; endingDate_ms: number };
      joins: number;
      leaves: number;
      unique_users: number;
    }[];
    GeneralData: any[];
    TotalVoiceTime: number;
    TotalVCChannels: number;
    TotalVCUsers: number;
    TotalVCJoins: number;
  }[];
}

function ClientComponent() {
  const searchParams = useSearchParams();
  const guildID = searchParams.get("guildID");
  const [voiceData, setVoiceData] = useState<VoiceDataResponse | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!guildID) return;
      try {
        const res = await fetch(`/api/server/${guildID}/fetchVoiceData`);
        const json = await res.json();
        setVoiceData(json);
      } catch (err) {
        console.error("Failed to fetch voice data:", err);
      }
    }
    fetchData();
  }, [guildID]);

  if (voiceData?.notFound) {
    return <GuildNotFound />;
  }

  if (!voiceData?.finalData) {
    return (
      <>
        <div className="mt-10 ml-10 text-2xl">Voice Analytics</div>
        <hr className="mt-2 mr-5 ml-5 w-50 sm:w-dvh" />

        <div className="mt-10 grid max-w-100 grid-rows-3 gap-y-4 sm:mx-5 sm:max-w-full sm:grid-cols-3 sm:grid-rows-none sm:gap-x-3 sm:gap-y-0">
          <Last24h />
          <Last7d />
          <Last4Weeks />
        </div>

        <div className="mx-5 h-full">
          <div className="mt-10 grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <ActiveChannels />
            </div>
            <div>
              <ActiveUsers />
            </div>
          </div>
        </div>

        <div className="sm:mx-5">
          <GeneralVoiceData />
        </div>

        <div className="mt-5 pb-5 text-center text-gray-600 text-xs">
          Thanks for using Cially Dashboard!
        </div>
      </>
    );
  }

  const data_24h = voiceData.finalData[0].HourData;
  const data_7d = voiceData.finalData[0].WeekData;
  const data_4w = voiceData.finalData[0].FourWeekData;
  const data_channels = voiceData.finalData[0].ChannelData;
  const data_users = voiceData.finalData[0].ActiveUsersData;
  const data_general = voiceData.finalData[0].GeneralData;
  const total_vc_time = voiceData.finalData[0].TotalVoiceTime;
  const total_vc_channels = voiceData.finalData[0].TotalVCChannels;
  const total_vc_users = voiceData.finalData[0].TotalVCUsers;
  const total_vc_joins = voiceData.finalData[0].TotalVCJoins;

  return (
    <>
      <div className="mt-10 ml-10 text-2xl">Voice Analytics</div>
      <hr className="mt-2 mr-5 ml-5 w-50 sm:w-dvh" />

      <ScrapeNotification />

      <div className="mt-10 grid max-w-100 grid-rows-3 gap-y-4 sm:mx-5 sm:max-w-full sm:grid-cols-3 sm:grid-rows-none sm:gap-x-3 sm:gap-y-0">
        <Last24h chartData={data_24h} />
        <Last7d chartData={data_7d} />
        <Last4Weeks chartData={data_4w} />
      </div>

      <div className="mx-5 h-full mt-10">
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <ActiveChannels chartData={data_channels} />
          </div>
          <div>
            <ActiveUsers chartData={data_users} />
          </div>
        </div>
      </div>

      <div className="sm:mr-5 sm:ml-5">
        <GeneralVoiceData
          generalData={data_general}
          totalVoiceTime={total_vc_time}
          totalVCChannels={total_vc_channels}
          totalVCUsers={total_vc_users}
          totalVCJoins={total_vc_joins}
        />
      </div>

      <div className="mt-5 pb-5 text-center text-gray-600 text-xs">
        Thanks for using Cially Dashboard!
      </div>
    </>
  );
}
