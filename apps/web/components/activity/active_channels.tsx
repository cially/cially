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
    label: "channel",
    color: "#0370ff",
  },
} satisfies ChartConfig;

export default function ActiveChannels({
  chartData,
}: {
  chartData?: { channel: string }[];
}) {
  const [useNumeric, setNumericStatus] = useState(false);

  function numericToggle() {
    if (useNumeric === true) {
      setNumericStatus(false);
    } else {
      setNumericStatus(true);
    }
  }

  if (!chartData) {
    return (
      <Card className="h-full w-full">
        <CardHeader>
          <CardTitle>Most Active Channels</CardTitle>
          <CardDescription>Last 4 weeks</CardDescription>
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
    return (
      <Card className="h-full w-full">
        <CardHeader>
          <div className="grid grid-cols-2">
            <CardTitle className="place-self-start">
              Most Active Channels
            </CardTitle>
            <CardTitle
              className="place-self-end rounded-full bg-white/0 p-0.5 transition-all hover:bg-white/10"
              onClick={() => numericToggle()}
            >
              {useNumeric === false ? <ArrowDown01 /> : <ChartPie />}
            </CardTitle>
          </div>
          <CardDescription>Last 4 weeks</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          {useNumeric === false ? (
            <ChartContainer
              className="aspect-square w-full"
              config={chartConfig}
            >
              <RadarChart data={chartData}>
                <ChartTooltip content={<ChartTooltipContent />} cursor={true} />
                <PolarAngleAxis dataKey="channel" />
                <PolarGrid />
                <Radar
                  dataKey="amount"
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
                data={chartData}
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
                  tickFormatter={(value) => value.slice(0, 3)}
                  tickLine={false}
                  tickMargin={10}
                  type="category"
                />
                <XAxis dataKey="amount" hide type="number" />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                  cursor={false}
                />
                <Bar
                  dataKey="amount"
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
                    className="fill-foreground"
                    dataKey="amount"
                    fontSize={12}
                    offset={8}
                    position="right"
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-center gap-2 text-sm">
          <div className="font-medium leading-none">
            Most Active Channel:{" "}
            <span className="ml-1 text-gray-300">{chartData[0].channel}</span>
          </div>
        </CardFooter>
      </Card>
    );
  } catch (_err) {
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
