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

interface DayVoiceData {
  date: string;
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

export default function Last7d({ chartData }: { chartData?: DayVoiceData[] }) {
  if (!chartData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Last 7 days</CardTitle>
          <CardDescription>
            Showing voice joins & leaves of the last 7 days
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

    const startingDate = new Date(Date.now() - 0 * 24 * 60 * 60 * 1000);
    const startingDate_formatted = `${(startingDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${startingDate.getUTCDate().toString().padStart(2, "0")}`;

    const previousDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const previousDate_formatted = `${(previousDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${previousDate.getUTCDate().toString().padStart(2, "0")}`;

    const currentItem = ArrayChartData.find((item) => item.date === startingDate_formatted);
    const previousItem = ArrayChartData.find((item) => item.date === previousDate_formatted);

    const currentAmount = currentItem?.joins ?? 0;
    const previousAmount = previousItem?.joins ?? 0;
    const difference = currentAmount - previousAmount;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Last 7 days</CardTitle>
          <CardDescription>
            Showing voice joins & leaves of the last 7 days
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
                dataKey="date"
                interval={0}
                tick={{
                  angle: -30,
                  fontSize: 10,
                  dx: -5,
                  dy: 5,
                }}
                tickFormatter={(value) => value.slice(0, 5)}
                tickLine={true}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} cursor={true} />
              <defs>
                <linearGradient id="fillJoins7d" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-joins)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-joins)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillLeaves7d" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-leaves)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-leaves)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="joins"
                fill="url(#fillJoins7d)"
                fillOpacity={0.4}
                stackId="a"
                stroke="var(--color-joins)"
                type="monotone"
              />
              <Area
                dataKey="leaves"
                fill="url(#fillLeaves7d)"
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
                    +{difference} joins than yesterday{" "}
                    <TrendingUp className="inline h-4 w-4" />
                  </div>
                ) : difference !== 0 ? (
                  <div className="text-red-400">
                    {difference} joins than yesterday{" "}
                    <TrendingDown className="inline h-4 w-4" />
                  </div>
                ) : (
                  <div className="text-gray-400">Same as yesterday</div>
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
          <CardTitle>Last 7 days</CardTitle>
          <CardDescription>
            Showing voice joins & leaves of the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-white/60">Not enough data</div>
        </CardContent>
      </Card>
    );
  }
}
