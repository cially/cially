"use client";
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

const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "hsl(var(--chart-1))",
	},
	mobile: {
		label: "Mobile",
		color: "hsl(var(--chart-2))",
	},
} satisfies ChartConfig;


export function MessageChart({ chartData }) {
	return (
		<>
			<Card className="mx-20 mt-5">
				<CardHeader>
					<CardTitle>Area Chart - Stacked</CardTitle>
					<CardDescription>
						Showing total visitors for the last 6 months
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer config={chartConfig} className="max-h-100 max-w-100">
						<AreaChart
							accessibilityLayer
							data={chartData}
							margin={{
								left: 12,
								right: 12,
							}}
						>
							<CartesianGrid vertical={true} />
							<XAxis
								dataKey="hour"
								tickLine={true}
								axisLine={true}
								tickMargin={10}
								tickFormatter={(value) => value.slice(0, 2)}
							/>
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent indicator="dot" hideLabel />}
							/>
							<Area
								dataKey="amount"
								type="linear"
								fill="var(--color-desktop)"
								fillOpacity={0.4}
								stroke="var(--color-desktop)"
							/>
						</AreaChart>
					</ChartContainer>
				</CardContent>
				<CardFooter>
					<div className="flex w-full items-start gap-2 text-sm">
						<div className="grid gap-2">
							<div className="flex items-center gap-2 font-medium leading-none">
								Trending up by 5.2% this month
							</div>
							<div className="flex items-center gap-2 text-muted-foreground leading-none">
								January - June 2024
							</div>
						</div>
					</div>
				</CardFooter>
			</Card>
		</>
	);
}
