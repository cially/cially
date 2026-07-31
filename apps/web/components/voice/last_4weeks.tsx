"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

interface WeekVoiceData {
  factor: string;
  starting_date: { startingDate_formatted: string; startingDate_ms: number };
  finishing_date: { endingDate_formatted: string; endingDate_ms: number };
  joins: number;
  leaves: number;
  unique_users: number;
}

const chartConfig = {
  joins: {
    label: "Voice Joins",
    color: "#0370ff",
  },
  leaves: {
    label: "Voice Leaves",
    color: "#ff1100",
  },
} satisfies ChartConfig;

export default function Last4Weeks({ chartData }: { chartData?: WeekVoiceData[] }) {
  if (!chartData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Last 4 weeks</CardTitle>
          <CardDescription>
            Showing voice joins & leaves of the last 4 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-37.5 w-62.5 place-self-center rounded-xl" />
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                <Skeleton className="h-2.5 w-20 place-self-center rounded-xl" />
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  }

  try {
    const ArrayChartData = Array(chartData)[0];

    const currentAmount = ArrayChartData.length > 0 ? ArrayChartData[ArrayChartData.length - 1].joins : 0;
    const previousAmount = ArrayChartData.length > 1 ? ArrayChartData[ArrayChartData.length - 2].joins : 0;

    const difference = currentAmount - previousAmount;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Last 4 weeks</CardTitle>
          <CardDescription>
            Showing voice joins & leaves of the last 4 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={true}
                dataKey="factor"
                tickLine={true}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} cursor={true} />
              <defs>
                <linearGradient id="fillJoins4w" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-joins)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-joins)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillLeaves4w" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-leaves)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-leaves)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="joins"
                fill="url(#fillJoins4w)"
                fillOpacity={0.4}
                stackId="a"
                stroke="var(--color-joins)"
                type="monotone"
              />
              <Area
                dataKey="leaves"
                fill="url(#fillLeaves4w)"
                fillOpacity={0.4}
                stackId="b"
                stroke="var(--color-leaves)"
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                {difference > 0 ? (
                  <div className="text-green-400">
                    +{difference} joins than last week{" "}
                    <TrendingUp className="inline h-4 w-4" />
                  </div>
                ) : difference !== 0 ? (
                  <div className="text-red-400">
                    {difference} joins than last week{" "}
                    <TrendingDown className="inline h-4 w-4" />
                  </div>
                ) : (
                  <div className="text-gray-400">Same as last week</div>
                )}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  } catch (err) {
    console.error(err);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Last 4 weeks</CardTitle>
          <CardDescription>
            Showing voice joins & leaves of the last 4 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-white/60">Not enough data</div>
        </CardContent>
      </Card>
    );
  }
}
