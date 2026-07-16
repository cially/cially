"use client";

import { ArrowDown01, ChartPie } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
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
  channel: {
    label: "Channel",
    color: "#0370ff", // Blue matching growth joins
  },
} satisfies ChartConfig;

interface ActiveChannelsProps {
  chartData?: {
    channel: string;
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

export default function ActiveChannels({ chartData }: ActiveChannelsProps) {
  const [useNumeric, setNumericStatus] = useState(false);

  function numericToggle() {
    setNumericStatus(!useNumeric);
  }

  if (!chartData) {
    return (
      <Card className="h-full w-full">
        <CardHeader>
          <CardTitle>Top Voice Channels</CardTitle>
          <CardDescription>Most active channels by voice time</CardDescription>
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
    // Convert duration to hours for the graph visual scale, but format labels in duration
    const processedData = chartData.map((item) => ({
      ...item,
      // For chart scaling, keep a number value. Let's use minutes to keep resolution
      displayAmount: Math.round(item.amount / 60),
    }));

    const maxChannel = chartData.length > 0 ? chartData[0] : null;

    return (
      <Card className="h-full w-full">
        <CardHeader>
          <div className="grid grid-cols-2">
            <CardTitle className="place-self-start">
              Top Voice Channels
            </CardTitle>
            <CardTitle
              className="place-self-end rounded-full bg-white/0 p-0.5 transition-all hover:bg-white/10 cursor-pointer"
              onClick={() => numericToggle()}
            >
              {useNumeric === false ? <ArrowDown01 /> : <ChartPie />}
            </CardTitle>
          </div>
          <CardDescription>Ranked by cumulative session time</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          {useNumeric === false ? (
            <ChartContainer
              className="aspect-square w-full"
              config={chartConfig}
            >
              <RadarChart data={processedData}>
                <ChartTooltip
                  cursor={true}
                  content={
                    <ChartTooltipContent
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
                />
                <PolarAngleAxis dataKey="channel" />
                <PolarGrid />
                <Radar
                  dataKey="displayAmount"
                  dot={{
                    r: 4,
                    fillOpacity: 1,
                  }}
                  fill="var(--color-channel)"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ChartContainer>
          ) : (
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={processedData}
                layout="vertical"
                margin={{
                  right: 16,
                }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  axisLine={false}
                  dataKey="channel"
                  hide
                  type="category"
                />
                <XAxis dataKey="displayAmount" hide type="number" />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
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
                />
                <Bar
                  dataKey="displayAmount"
                  fill="#0370ff"
                  radius={4}
                >
                  <LabelList
                    className="fill-white"
                    dataKey="channel"
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
        <CardFooter className="flex items-center justify-center gap-2 text-sm">
          {maxChannel && (
            <div className="font-medium leading-none">
              Most Active Channel:{" "}
              <span className="ml-1 text-white font-semibold">{maxChannel.channel}</span> ({formatDuration(maxChannel.amount)})
            </div>
          )}
        </CardFooter>
      </Card>
    );
  } catch (err) {
    console.error(err);
    return (
      <Card className="h-full w-full">
        <CardHeader>
          <CardTitle>Top Voice Channels</CardTitle>
          <CardDescription>Most active channels by voice time</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="text-center py-6 text-white/60">Not enough data</div>
        </CardContent>
      </Card>
    );
  }
}
