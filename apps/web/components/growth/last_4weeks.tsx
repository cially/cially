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

export default function Last4Weeks({ chartData }) {
  const chartConfig = {
    joins: {
      label: "Joins",
      color: "#0370ff",
    },
    leaves: {
      label: "Leaves",
      color: "#ff1100",
    },
  } satisfies ChartConfig;

  if (!chartData) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Last 4 weeks days</CardTitle>
            <CardDescription>
              Showing total messages for the last 4 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-[250px] h-[150px] place-self-center rounded-xl" />
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 font-medium leading-none">
                  <Skeleton className="w-20 h-[10px] place-self-center rounded-xl" />
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </>
    );
  }

  try {
    const ArrayChartData = Array(chartData)[0];

    const startingDate = new Date(Date.now() - 0 * 24 * 60 * 60 * 1000);
    const startingDate_factor = startingDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const previousDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const previousDate_factor = previousDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const currentAmount_index = ArrayChartData.findIndex(
      (item) => item.factor === startingDate_factor,
    );
    const currentAmount = ArrayChartData[currentAmount_index].unique_users;

    const previousAmount_index = ArrayChartData.findIndex(
      (item) => item.factor === previousDate_factor,
    );
    const previousAmount = ArrayChartData[previousAmount_index].unique_users;

    const difference = currentAmount - previousAmount;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Last 4 weeks days</CardTitle>
          <CardDescription>
            Showing total joins & leaves of the last 4 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="factor"
                tickLine={true}
                axisLine={true}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 8)}
                tick={{
                  angle: -30,
                  fontSize: 10,
                  dx: -5,
                  dy: 5,
                }}
                interval={0}
              />
              <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="fillJoins" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-joins)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-joins)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillLeaves" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-leaves)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-leaves)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="joins"
                type="monotone"
                fill="url(#fillJoins)"
                fillOpacity={0.4}
                stroke="var(--color-joins)"
                stackId="a"
              />
              <Area
                dataKey="leaves"
                type="monotone"
                fill="url(#fillLeaves)"
                fillOpacity={0.4}
                stroke="var(--color-leaves)"
                stackId="b"
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
                    +{difference} unique users than previous week{" "}
                    <TrendingUp className="inline h-4 w-4" />
                  </div>
                ) : difference !== 0 ? (
                  <div className="text-red-400">
                    {difference} unique users than previous week{" "}
                    <TrendingDown className="inline h-4 w-4" />
                  </div>
                ) : (
                  <div className="text-gray-400">
                    +{difference} unique users than previous week
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  } catch (_err) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Last 4 weeks days</CardTitle>
          <CardDescription>
            Showing total joins & leaves of the last 4 weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">Not enough data</div>
        </CardContent>
      </Card>
    );
  }
}
