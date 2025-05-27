"use client";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";

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
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig

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
              dataKey="author"
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
              content={<ChartTooltipContent indicator="line"/>}
            />
            <Bar
              dataKey="amount"
              layout="vertical"
              fill="var(--color-desktop)"
              radius={4}
            >
              <LabelList
                dataKey="author"
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
