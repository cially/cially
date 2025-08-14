"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "Total Joins & Leaves of each hour (UTC)";

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

export function TotalStatsGraph({ chartData }) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("joins");
  const total = React.useMemo(
    () => ({
      joins: chartData.reduce((acc, curr) => acc + curr.joins, 0),
      leaves: chartData.reduce((acc, curr) => acc + curr.leaves, 0),
    }),
    [chartData]
  );
  try {
    return (
      <Card className="py-0">
        <CardHeader className="!p-0 flex flex-col items-stretch border-b sm:flex-row">
          <div className="sm:!py-0 flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3">
            <CardTitle>Hourly Activity Overview</CardTitle>
            <CardDescription>
              Total joins & leaves for each hour across all days (UTC)
            </CardDescription>
          </div>
          <div className="flex">
            {["joins", "leaves"].map((key) => {
              const chart = key as keyof typeof chartConfig;
              return (
                // biome-ignore lint/a11y/useButtonType: ShadCN
                <button
                  className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                  data-active={activeChart === chart}
                  key={chart}
                  onClick={() => setActiveChart(chart)}
                >
                  <span className="text-muted-foreground text-xs">
                    {chartConfig[chart].label}
                  </span>
                  <span
                    className={"font-bold text-lg leading-none sm:text-3xl"}
                  >
                    {total[key as keyof typeof total].toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer
            className="aspect-auto h-[250px] w-full"
            config={chartConfig}
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="hour"
                minTickGap={32}
                tickFormatter={(value) => value}
                tickLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[180px]"
                    formatter={(value, name) => (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              chartConfig[name as keyof typeof chartConfig]
                                ?.color,
                          }}
                        />
                        <span className="capitalize">{name}:</span>
                        <span className="font-bold">
                          {name === "net" && value > 0 ? "+" : ""}
                          {value}
                        </span>
                      </div>
                    )}
                    labelFormatter={(value) => `${value}`}
                  />
                }
              />
              <Bar
                dataKey={activeChart}
                fill={chartConfig[activeChart].color}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  } catch (_err) {
    return (
      <Card className="py-0">
        <CardHeader className="p-5">
          <div className="sm:!py-0 flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3">
            <CardTitle>Hourly Activity Overview</CardTitle>
            <CardDescription>
              Total joins & leaves for each hour across all days (UTC)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="text-center">Not enough data</div>
        </CardContent>
      </Card>
    );
  }
}
