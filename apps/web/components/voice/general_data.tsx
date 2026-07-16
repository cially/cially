"use client";

import { useState } from "react";
import {
  Activity,
  Clock,
  Columns,
  Columns2,
  Columns3,
  EqualApproximately,
  LandPlot,
  TrendingDown,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PeriodData = {
  period: string;
  total_joins: number;
  total_leaves: number;
  total_unique_users: number;
  net_growth: number;
  join_to_leave_ratio: number | string;
  join_to_unique_ratio: number | string;
  leave_to_unique_ratio: number | string;
  average_joins_per_day: number | string;
  average_leaves_per_day: number | string;
  average_unique_users_per_day: number | string;
};

type StatCardProps = {
  icon: React.ElementType;
  label: string;
  value: number | string;
  isNetGrowth?: boolean;
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  isNetGrowth = false,
}: StatCardProps) => (
  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
    <Icon className="h-4 w-4 text-white" />
    <div className="flex-1">
      <div className="text-white/60 text-xs">{label}</div>
      <div
        className={`font-semibold ${
          isNetGrowth
            ? value.toString().startsWith("+")
              ? "text-green-400"
              : value.toString().startsWith("-")
                ? "text-red-400"
                : "text-white"
            : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  </div>
);

const PeriodContent = ({ data }: { data: PeriodData }) => (
  <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3">
    <StatCard
      icon={UserPlus}
      label="Voice Joins"
      value={data.total_joins.toLocaleString()}
    />
    <StatCard
      icon={UserMinus}
      label="Voice Leaves"
      value={data.total_leaves.toLocaleString()}
    />
    <StatCard
      icon={EqualApproximately}
      label="Join/Leave Ratio"
      value={data.join_to_leave_ratio}
    />
    <StatCard
      icon={Activity}
      label="Avg Joins/Day"
      value={data.average_joins_per_day}
    />
    <StatCard
      icon={Activity}
      label="Avg Leaves/Day"
      value={data.average_leaves_per_day}
    />
  </div>
);

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

interface GeneralVoiceDataProps {
  generalData?: PeriodData[];
  totalVoiceTime?: number;
  totalVCChannels?: number;
  totalVCUsers?: number;
  totalVCJoins?: number;
}

export default function GeneralVoiceData({
  generalData,
  totalVoiceTime,
}: GeneralVoiceDataProps) {
  const [activeTab, setActiveTab] = useState("today");

  if (!generalData || totalVoiceTime === undefined) {
    return (
      <Card className="mt-10 grid auto-rows-auto px-10 py-6 sm:min-w-dvh border-white/10">
        <div>
          <div className="font-semibold text-xl flex items-center gap-2">
            <Activity className="h-5 w-5 text-white" />
            General Data
          </div>
          <div className="mt-1 font-sans text-sm text-white/60">
            More insights regarding voice activity
          </div>
        </div>
        <Skeleton className="mt-4 h-32 w-full" />
      </Card>
    );
  }

  try {
    const todayData = generalData.find((data) => data.period === "today");
    const weekData = generalData.find((data) => data.period === "week");
    const monthData = generalData.find((data) => data.period === "month");

    return (
      <Card className="mt-10 px-6 py-6 sm:min-w-dvh border-white/10">
        <div className="mb-6">
          <div className="font-semibold text-xl flex items-center gap-2 text-white">
            <Activity className="h-5 w-5" />
            General Data
          </div>
          <div className="mt-1 font-sans text-sm text-white/60">
            More insights regarding guild's voice activity
          </div>
        </div>

        {/* Hero Section: Total Voice Duration */}
        <div className="mb-4 flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-5">
          <Clock className="h-6 w-6 text-white" />
          <div className="flex-1">
            <div className="text-white/60 text-xs">Total Voice Duration</div>
            <div className="text-2xl font-bold text-white mt-0.5">
              {formatDuration(totalVoiceTime)}
            </div>
          </div>
        </div>

        <Tabs className="w-full" defaultValue="today" onValueChange={setActiveTab}>
          <TabsList className="relative mb-6 grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <div
              className="absolute top-1 bottom-1 rounded-md bg-white/10 transition-all duration-300 ease-in-out"
              style={{
                width: "calc(33.333% - 4px)",
                left: activeTab === "today"
                  ? "4px"
                  : activeTab === "week"
                    ? "calc(33.333% + 2px)"
                    : "calc(66.666%)"
              }}
            />
            <TabsTrigger className="relative z-10 cursor-pointer data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:border-transparent dark:data-[state=active]:border-transparent data-[state=active]:shadow-none flex items-center gap-2 text-white/70 data-[state=active]:text-white" value="today">
              <Columns className="h-4 w-4" />
              Today
            </TabsTrigger>
            <TabsTrigger className="relative z-10 cursor-pointer data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:border-transparent dark:data-[state=active]:border-transparent data-[state=active]:shadow-none flex items-center gap-2 text-white/70 data-[state=active]:text-white" value="week">
              <Columns2 className="h-4 w-4" />
              Week
            </TabsTrigger>
            <TabsTrigger className="relative z-10 cursor-pointer data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:border-transparent dark:data-[state=active]:border-transparent data-[state=active]:shadow-none flex items-center gap-2 text-white/70 data-[state=active]:text-white" value="month">
              <Columns3 className="h-4 w-4" />
              Month
            </TabsTrigger>
          </TabsList>

          {todayData && (
            <TabsContent className="space-y-4 outline-none" value="today">
              <div className="font-medium text-lg text-white/90">
                Today's Voice Activity
              </div>
              <PeriodContent data={todayData} />
            </TabsContent>
          )}

          {weekData && (
            <TabsContent className="space-y-4 outline-none" value="week">
              <div className="font-medium text-lg text-white/90">
                Weekly Voice Summary
              </div>
              <PeriodContent data={weekData} />
            </TabsContent>
          )}

          {monthData && (
            <TabsContent className="space-y-4 outline-none" value="month">
              <div className="font-medium text-lg text-white/90">
                Monthly Voice Overview
              </div>
              <PeriodContent data={monthData} />
            </TabsContent>
          )}
        </Tabs>
      </Card>
    );
  } catch (err) {
    console.error("Error rendering general voice data:", err);
    return (
      <Card className="mt-10 grid auto-rows-auto px-10 py-6 sm:min-w-dvh border-white/10">
        <div>
          <div className="font-semibold text-xl flex items-center gap-2">
            <Activity className="h-5 w-5 text-white" />
            General Data
          </div>
        </div>
        <div className="py-8 text-center text-white/60">
          Not enough data available
        </div>
      </Card>
    );
  }
}
