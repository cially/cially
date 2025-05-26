"use client";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

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
    label: "channel",
    color: "#03d5ff",
  },
} satisfies ChartConfig;

export default function ActiveChannels({ chartData }) {
  if (!chartData) {
    return (
      <>
        <Card className="h-full w-full">
          <CardHeader>
            <CardTitle>Most Active Channels</CardTitle>
            <CardDescription>Last 4 weeks</CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            <Skeleton className="w-full h-30" />
          </CardContent>
          <CardFooter className="flex items-center justify-center gap-2 text-sm">
            <Skeleton className="w-20 h-5 rounded-md" />
          </CardFooter>
        </Card>
      </>
    );
  }
  try {
    return (
      <Card className="h-full w-full">
        <CardHeader>
          <CardTitle>Most Active Channels</CardTitle>
          <CardDescription>Last 4 weeks</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <ChartContainer config={chartConfig} className="aspect-square w-full">
            <RadarChart data={chartData}>
              <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
              <PolarAngleAxis dataKey="channel" />
              <PolarGrid />
              <Radar
                dataKey="amount"
                fill="var(--color-channel)"
                fillOpacity={0.6}
                dot={{
                  r: 4,
                  fillOpacity: 1,
                }}
              />
            </RadarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex items-center justify-center gap-2 text-sm">
          <div className="font-medium leading-none">
            Most Active Channel:{" "}
            <span className="ml-1 text-gray-300">{chartData[0].channel}</span>
          </div>
        </CardFooter>
      </Card>
    );
  } catch (err) {
    return (
      <Card className="h-full w-full">
        <CardHeader>
          <CardTitle>Most Active Channels</CardTitle>
          <CardDescription>Last 4 weeks</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="text-center">Not enough data</div>
        </CardContent>
        
      </Card>
    );
  }
}
