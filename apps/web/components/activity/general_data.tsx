import { Activity, Eclipse, Moon, Sun, UsersRound } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function GeneralActivityData({
  chartData,
}: {
  chartData?: {
    total: number;
    online: number;
    idle: number;
    offline: number;
  }[];
}) {
  if (!chartData) {
    return (
      <Card className="mt-10 grid auto-rows-auto px-10 sm:min-w-dvh">
        <div>
          <div className="font-semibold text-xl">
            <Activity className="mr-2 inline" />
            General Data
          </div>
          <div className="mt-1 font-sans text-sm text-white/60">
            More insights regarding guild's activity
          </div>
        </div>
        <Skeleton className="h-15 w-full" />
      </Card>
    );
  }

  try {
    const ArrayChartData = Array(chartData)[0];
    console.log(ArrayChartData);

    return (
      <Card className="mt-10 grid auto-rows-auto px-10 sm:min-w-dvh">
        <div>
          <div className="font-semibold text-xl">
            <Activity className="mr-2 inline" />
            General Data
          </div>
          <div className="mt-1 font-sans text-sm text-white/60">
            More insights regarding guild's activity
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
          <StatCard
            icon={UsersRound}
            label="Total Members"
            value={ArrayChartData[0].total}
          />
          <StatCard
            icon={Sun}
            label="Online Members"
            value={ArrayChartData[0].online}
          />
          <StatCard
            icon={Eclipse}
            label="Idle Members"
            value={ArrayChartData[0].idle}
          />
          <StatCard
            icon={Moon}
            label="Offline Members"
            value={ArrayChartData[0].offline}
          />
        </div>
      </Card>
    );
  } catch (_err) {
    return (
      <Card className="mt-10 grid auto-rows-auto px-10 sm:min-w-dvh">
        <div>
          <div className="font-semibold text-xl">
            <Activity className="mr-2 inline" />
            General Data
          </div>
          <div className="mt-1 font-sans text-sm text-white/60">
            More insights regarding guild's activity
          </div>
        </div>
        <div className="text-center">Not enough data</div>
      </Card>
    );
  }
}
