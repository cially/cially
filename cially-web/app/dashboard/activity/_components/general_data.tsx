import { Activity, Eclipse, Moon, Sun, UsersRound } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({ icon: Icon, label, value, isNetGrowth = false }) => (
  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
    <Icon className="h-4 w-4 text-white" />
    <div className="flex-1">
      <div className="text-xs text-white/60">{label}</div>
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

export default function GeneralActivityData({ chartData }) {
  if (!chartData) {
    return (
      <>
        <Card className="mt-10 grid  auto-rows-auto px-10 sm:min-w-dvh">
          <div>
            <div className="text-xl font-semibold">
              <Activity className="inline mr-2" />
              General Data
            </div>
            <div className="font-sans text-sm mt-1 text-white/60">
              More insights regarding guild's activity
            </div>
          </div>
          <Skeleton className="w-full h-15" />
        </Card>
      </>
    );
  }

  try {
    const ArrayChartData = Array(chartData)[0];
    console.log(ArrayChartData);

    return (
      <>
        <Card className="mt-10 grid  auto-rows-auto px-10 sm:min-w-dvh">
          <div>
            <div className="text-xl font-semibold">
              <Activity className="inline mr-2" />
              General Data
            </div>
            <div className="font-sans text-sm mt-1 text-white/60">
              More insights regarding guild's activity
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
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
      </>
    );
  } catch (err) {
    return (
      <>
        <Card className="mt-10 grid  auto-rows-auto px-10 sm:min-w-dvh">
          <div>
            <div className="text-xl font-semibold">
              <Activity className="inline mr-2" />
              General Data
            </div>
            <div className="font-sans text-sm mt-1 text-white/60">
              More insights regarding guild's activity
            </div>
          </div>
          <div className="text-center">Not enough data</div>
        </Card>
      </>
    );
  }
}
