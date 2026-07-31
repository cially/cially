"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
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

const chartConfig = {
  desktop: {
    label: "Voice",
    color: "#0370ff", // Blue matching messages / growth page
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

interface ActiveUsersProps {
  chartData?: {
    author: string;
    originalId: string;
    amount: number; // in seconds
  }[];
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export default function ActiveUsers({ chartData }: ActiveUsersProps) {
  if (!chartData) {
    return (
      <Card className="h-full w-full">
        <CardHeader>
          <CardTitle>Most Active Users (Voice)</CardTitle>
          <CardDescription>Most active users by cumulative voice time</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <Skeleton className="h-30 w-full" />
        </CardContent>
        <CardFooter className="flex items-center justify-center gap-2 text-sm">
          <Skeleton className="h-5 w-20 rounded-md" />
        </CardFooter>
      </Card>
    );
  }

  try {
    const processedData = chartData.map((item) => ({
      ...item,
      // For chart scaling, keep a number value. Let's use minutes to keep resolution
      displayAmount: Math.round(item.amount / 60),
    }));

    const maxUser = chartData.length > 0 ? chartData[0] : null;

    return (
      <Card className="flex h-full w-full flex-col">
        <CardHeader>
          <CardTitle>Most Active Users (Voice)</CardTitle>
          <CardDescription>Most active users by cumulative voice time</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          {chartData.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-white/40">
              No voice activity recorded
            </div>
          ) : (
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={processedData}
                layout="vertical"
                margin={{
                  right: 24,
                }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  axisLine={false}
                  dataKey="author"
                  hide
                  type="category"
                />
                <XAxis dataKey="displayAmount" hide type="number" />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      formatter={(value) => (
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-[#0370ff]" />
                          <span className="text-white/60">Voice Time:</span>
                          <span className="font-bold text-white">
                            {formatDuration(Number(value) * 60)}
                          </span>
                        </div>
                      )}
                    />
                  }
                  cursor={false}
                />
                <Bar
                  dataKey="displayAmount"
                  fill="var(--color-desktop)"
                  radius={4}
                >
                  <LabelList
                    className="fill-white"
                    dataKey="author"
                    fontSize={12}
                    offset={8}
                    position="insideRight"
                  />
                  <LabelList
                    className="fill-foreground font-semibold"
                    dataKey="amount"
                    fontSize={12}
                    formatter={(value) => formatDuration(Number(value))}
                    offset={8}
                    position="right"
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
        <CardFooter className="mt-auto flex items-center justify-center gap-2 text-sm">
          {maxUser && (
            <div className="font-medium">
              Most Active User:{" "}
              <span className="ml-1 font-semibold text-white">{maxUser.author}</span> ({formatDuration(maxUser.amount)})
            </div>
          )}
        </CardFooter>
      </Card>
    );
  } catch (err) {
    console.error(err);
    return (
      <Card className="flex h-full w-full flex-col">
        <CardHeader>
          <CardTitle>Most Active Users (Voice)</CardTitle>
          <CardDescription>Most active users by cumulative voice time</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-center py-6 text-white/60">Not enough data</div>
        </CardContent>
      </Card>
    );
  }
}
