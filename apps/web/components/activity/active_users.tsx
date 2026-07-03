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
    label: "Desktop",
    color: "#0370ff",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

export default function ActiveUsers({
  chartData,
}: {
  chartData?: { author: string; amount: number }[];
}) {
  if (!chartData) {
    return (
      <Card className="h-full w-full">
        <CardHeader>
          <CardTitle>Most Active Users (Messages)</CardTitle>
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
      <Card className="flex h-full w-full flex-col ">
        <CardHeader>
          <CardTitle>Most Active Users (Messages)</CardTitle>
          <CardDescription>Last 4 weeks</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
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
                dataKey="author"
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
                  className="fill-foreground"
                  dataKey="amount"
                  fontSize={12}
                  offset={8}
                  position="right"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="mt-auto flex items-center justify-center gap-2 text-sm">
          <div className="font-medium">
            Most Active User:{" "}
            <span className="ml-1 text-gray-300">{chartData[0].author}</span>
          </div>
        </CardFooter>
      </Card>
    );
  } catch (_err) {
    return (
      <Card className="flex h-full w-full flex-col ">
        <CardHeader>
          <CardTitle>Most Active Users (Messages)</CardTitle>
          <CardDescription>Last 4 weeks</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-center">Not enough data</div>
        </CardContent>
      </Card>
    );
  }
}
