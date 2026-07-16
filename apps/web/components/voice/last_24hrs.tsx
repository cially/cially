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

interface HourVoiceData {
  hour: string;
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

export default function Last24h({ chartData }: { chartData?: HourVoiceData[] }) {
  if (!chartData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Last 24 hours (UTC)</CardTitle>
          <CardDescription>
            Showing voice joins & leaves of the last 24 hours
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

    const currentHour = new Date().getUTCHours().toString().padStart(2, "0");
    const previousHour = ((new Date().getUTCHours() - 1 + 24) % 24).toString().padStart(2, "0");

    const currentItem = ArrayChartData.find((item) => item.hour === currentHour);
    const previousItem = ArrayChartData.find((item) => item.hour === previousHour);

    const currentAmount = currentItem?.joins ?? 0;
    const previousAmount = previousItem?.joins ?? 0;
    const difference = currentAmount - previousAmount;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Last 24 hours (UTC)</CardTitle>
          <CardDescription>
            Showing voice joins & leaves of the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={true}
                dataKey="hour"
                tickFormatter={(value) => `${value}:00`}
                tickLine={true}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} cursor={true} />
              <defs>
                <linearGradient id="fillJoins24" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-joins)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-joins)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillLeaves24" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-leaves)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-leaves)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="joins"
                fill="url(#fillJoins24)"
                fillOpacity={0.4}
                stackId="a"
                stroke="var(--color-joins)"
                type="monotone"
              />
              <Area
                dataKey="leaves"
                fill="url(#fillLeaves24)"
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
                    +{difference} joins than previous hour{" "}
                    <TrendingUp className="inline h-4 w-4" />
                  </div>
                ) : difference !== 0 ? (
                  <div className="text-red-400">
                    {difference} joins than previous hour{" "}
                    <TrendingDown className="inline h-4 w-4" />
                  </div>
                ) : (
                  <div className="text-gray-400">Same as previous hour</div>
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
          <CardTitle>Last 24 hours (UTC)</CardTitle>
          <CardDescription>
            Showing voice joins & leaves of the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-white/60">Not enough data</div>
        </CardContent>
      </Card>
    );
  }
}
