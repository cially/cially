"use client";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

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
    label: "Desktop",
    color: "#0370ff",
  },
} satisfies ChartConfig;

export default function ActiveHours({
  chartData,
}: {
  chartData?: { hours: number; amount: number }[];
}) {
  if (!chartData) {
    return (
      <Card className="h-full w-full">
        <CardHeader>
          <CardTitle>Most Active Hours (UTC)</CardTitle>
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
          <CardTitle>Most Active Hours (UTC)</CardTitle>
          <CardDescription>Last 4 weeks</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-4">
          <ChartContainer
            className="w-full"
            config={chartConfig}
            style={{ height: "300px" }}
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              height={260}
              margin={{
                top: 20,
                bottom: 20,
                left: 10,
                right: 10,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={true}
                dataKey="hour"
                tickFormatter={(value) => value.slice(0, 2)}
                tickLine={true}
                tickMargin={10}
              />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
                cursor={true}
              />
              <Bar dataKey="amount" fill="var(--color-desktop)" radius={4}>
                <LabelList
                  className="fill-foreground"
                  fontSize={12}
                  offset={12}
                  position="top"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex items-center justify-center gap-2 text-sm" />
      </Card>
    );
  } catch (_err) {
    return (
      <Card className="h-full w-full">
        <CardHeader>
          <CardTitle>Most Active Hours (UTC)</CardTitle>
          <CardDescription>Last 4 weeks</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-4">
          <div className="text-center">Not enough data</div>
        </CardContent>
        <CardFooter className="flex items-center justify-center gap-2 text-sm" />
      </Card>
    );
  }
}
