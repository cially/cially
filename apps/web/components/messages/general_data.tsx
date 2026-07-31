import {
  Activity,
  Camera,
  MessageCircle,
  SquarePen,
  Trash2,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  isNetGrowth?: boolean;
}

const StatCard = ({ icon: Icon, label, value, isNetGrowth = false }: StatCardProps) => (
  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
    <Icon className="h-4 w-4 text-white" />
    <div className="flex-1">
      <div className="text-white/60 text-xs">{label}</div>
      <div
        className={`font-semibold ${isNetGrowth
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

interface GeneralDataProps {
  chartData?: {
    total_messages: number;
    message_deletions: number;
    message_edits: number;
    total_attachments: number;
  }[];
}

export default function GeneralMessageDataCard({ chartData }: GeneralDataProps) {
  if (!chartData) {
    return (
      <Card className="mt-10 grid auto-rows-auto px-10 sm:min-w-dvh">
        <div>
          <div className="font-semibold text-xl">
            <Activity className="mr-2 inline" />
            General Data
          </div>
          <div className="mt-1 font-sans text-sm text-white/60">
            More insights regarding the messages and their content
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
            More insights regarding the messages and their content
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 ">
          <StatCard
            icon={MessageCircle}
            label="Total Messages"
            value={ArrayChartData[0].total_messages}
          />
          <StatCard
            icon={Camera}
            label="Total Media"
            value={ArrayChartData[0].total_attachments}
          />
          <StatCard
            icon={Trash2}
            label="Message Deletions"
            value={ArrayChartData[0].message_deletions}
          />
          <StatCard
            icon={SquarePen}
            label="Message Edits"
            value={ArrayChartData[0].message_edits}
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
            More insights regarding the messages and their content
          </div>
        </div>
        <div className="text-center">Not enough data</div>
      </Card>
    );
  }
}
