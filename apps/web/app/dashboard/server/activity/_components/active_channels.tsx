"use client";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import { ArrowDown01, ChartPie } from "lucide-react";

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
import { useState } from "react";

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
          <div className="grid grid-cols-2">
            <CardTitle className="place-self-start">
              Most Active Channels
            </CardTitle>
            <CardTitle
              className="place-self-end rounded-full bg-white/0 hover:bg-white/10 transition-all p-0.5"
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
              config={chartConfig}
              className="aspect-square w-full"
            >
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
                  dataKey="channel"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                  hide
                />
                <XAxis dataKey="amount" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar
                  dataKey="amount"
                  layout="vertical"
                  fill="#0370ff"
                  radius={4}
                >
                  <LabelList
                    dataKey="channel"
                    position="insideRight"
                    offset={8}
                    className="fill-white"
                    fontSize={12}
                  />
                  <LabelList
                    dataKey="amount"
                    position="right"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
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
