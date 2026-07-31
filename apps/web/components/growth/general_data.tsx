import { useState } from "react";
import {
  Activity,
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
  join_to_leave_ratio: number;
  retention_rate: number;
  average_joins_per_day: number;
  average_leaves_per_day: number;
  join_to_unique_ratio: number;
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
      label="Total Joins"
      value={data.total_joins.toLocaleString()}
    />
    <StatCard
      icon={UserMinus}
      label="Total Leaves"
      value={data.total_leaves.toLocaleString()}
    />
    <StatCard
      icon={Users}
      label="Unique Users"
      value={data.total_unique_users.toLocaleString()}
    />
    <StatCard
      icon={data.net_growth >= 0 ? TrendingUp : TrendingDown}
      isNetGrowth={true}
      label="Growth"
      value={`${data.net_growth >= 0 ? "+" : ""}${data.net_growth.toLocaleString()}`}
    />
    <StatCard
      icon={EqualApproximately}
      label="Join/Leave Ratio"
      value={data.join_to_leave_ratio}
    />
    <StatCard
      icon={LandPlot}
      label="Retention Rate"
      value={data.retention_rate}
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
    <div className="col-span-2 sm:col-span-1">
      <StatCard
        icon={Activity}
        label="Join/User Ratio"
        value={data.join_to_unique_ratio}
      />
    </div>
  </div>
);

export default function GeneralMessageDataCard({
  generalData,
}: {
  generalData?: PeriodData[];
}) {
  const [activeTab, setActiveTab] = useState("today");

  if (!generalData) {
    return (
      <Card className="mt-10 grid auto-rows-auto px-10 py-6 sm:min-w-dvh">
        <div>
          <div className="font-semibold text-xl">
            <Activity className="mr-2 inline" />
            General Data
          </div>
          <div className="mt-1 font-sans text-sm text-white/60">
            More insights regarding user activity and engagement
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
      <Card className="mt-10 px-6 py-6 sm:min-w-dvh">
        <div className="mb-6">
          <div className="font-semibold text-xl">
            <Activity className="mr-2 inline" />
            General Data
          </div>
          <div className="mt-1 font-sans text-sm text-white/60">
            More insights regarding user activity and engagement
          </div>
        </div>

        <Tabs className="w-full" defaultValue="today" onValueChange={setActiveTab}>
          <TabsList className="relative mb-6 grid w-full grid-cols-3">
            <div
              className="absolute top-0.75 bottom-0.75 rounded-md bg-white/13 border border-white/30 transition-all duration-300 ease-in-out"
              style={{
                width: "calc(33.333% - 2px)",
                left: activeTab === "today"
                  ? "3px"
                  : activeTab === "week"
                    ? "calc(33.333% + 1px)"
                    : "calc(66.666% - 1px)"
              }}
            />
            <TabsTrigger className="relative z-10 cursor-pointer data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:border-transparent dark:data-[state=active]:border-transparent data-[state=active]:shadow-none flex items-center gap-2" value="today">
              <Columns className="h-4 w-4" />
              Today
            </TabsTrigger>
            <TabsTrigger className="relative z-10 cursor-pointer data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:border-transparent dark:data-[state=active]:border-transparent data-[state=active]:shadow-none flex items-center gap-2" value="week">
              <Columns2 className="h-4 w-4" />
              Week
            </TabsTrigger>
            <TabsTrigger className="relative z-10 cursor-pointer data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:border-transparent dark:data-[state=active]:border-transparent data-[state=active]:shadow-none flex items-center gap-2" value="month">
              <Columns3 className="h-4 w-4" />
              Month
            </TabsTrigger>
          </TabsList>

          {todayData && (
            <TabsContent className="space-y-4" value="today">
              <div className="font-medium text-lg text-white/90">
                Today's Activity
              </div>
              <PeriodContent data={todayData} />
            </TabsContent>
          )}

          {weekData && (
            <TabsContent className="space-y-4" value="week">
              <div className="font-medium text-lg text-white/90">
                Weekly Summary
              </div>
              <PeriodContent data={weekData} />
            </TabsContent>
          )}

          {monthData && (
            <TabsContent className="space-y-4" value="month">
              <div className="font-medium text-lg text-white/90">
                Monthly Overview
              </div>
              <PeriodContent data={monthData} />
            </TabsContent>
          )}
        </Tabs>
      </Card>
    );
  } catch (err) {
    console.error("Error rendering general data:", err);
    return (
      <Card className="mt-10 grid auto-rows-auto px-10 py-6 sm:min-w-dvh">
        <div>
          <div className="font-semibold text-xl">
            <Activity className="mr-2 inline" />
            General Data
          </div>
          <div className="mt-1 font-sans text-sm text-white/60">
            More insights regarding user activity and engagement
          </div>
        </div>
        <div className="py-8 text-center text-white/60">
          Not enough data available
        </div>
      </Card>
    );
  }
}
