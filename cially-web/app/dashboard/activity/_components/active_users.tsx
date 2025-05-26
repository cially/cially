"use client";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

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
    color: "#03d5ff",
  },
} satisfies ChartConfig;

export default function ActiveUsers({ chartData }) {
  if (!chartData) {
    return (
      <>
        <Card className="h-full w-full">
          <CardHeader>
            <CardTitle>Most Active Users (Messages)</CardTitle>
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
      <Card className="h-full w-full flex flex-col ">
        <CardHeader>
          <CardTitle>Most Active Users (Messages)</CardTitle>
          <CardDescription>Last 4 weeks</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <ChartContainer config={chartConfig} className="w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ left: 10, right: 10 }}
              barCategoryGap={20}
            >
              <YAxis
                dataKey="author"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "#cbd5e1",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              />
              <XAxis dataKey="amount" type="number" hide />
              <ChartTooltip
                cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="amount"
                layout="vertical"
                radius={[5, 5, 5, 5]}
                fill="#03d5ff"
              />
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
  } catch (err) {
    return (
      <Card className="h-full w-full flex flex-col ">
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
