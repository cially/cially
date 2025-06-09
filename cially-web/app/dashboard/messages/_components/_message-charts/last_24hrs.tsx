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

export default function Last24h({ chartData }) {
	if (!chartData) {
		return (
			<>
				<Card>
					<CardHeader>
						<CardTitle>Last 24 hours (UTC)</CardTitle>
						<CardDescription>
							Showing total messages for the last 24 hours
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
		console.log(ArrayChartData);

		const startingDate = new Date(Date.now() - 0 * 24 * 60 * 60 * 1000);
		const startingDate_formatted = `${startingDate
			.getUTCHours()
			.toString()
			.padStart(2, "0")}`;

		const previousDate = new Date(Date.now() - 1 * 60 * 60 * 1000);
		const previousDate_formatted = `${previousDate
			.getUTCHours()
			.toString()
			.padStart(2, "0")}`;

		const currentAmount_index = ArrayChartData.findIndex(
			(item) => item.hour === startingDate_formatted,
		);
		const currentAmount = ArrayChartData[currentAmount_index].amount;

		const previousAmount_index = ArrayChartData.findIndex(
			(item) => item.hour === previousDate_formatted,
		);
		const previousAmount = ArrayChartData[previousAmount_index].amount;

		const difference = currentAmount - previousAmount;

		const chartConfig = {
			hour: {
				label: "hour",
				color: "#0370ff",
			},
		} satisfies ChartConfig;

		return (
			<Card>
				<CardHeader>
					<CardTitle>Last 24 hours (UTC)</CardTitle>
					<CardDescription>
						Showing total messages for the last 24 hours
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
							<CartesianGrid vertical={true} />
							<XAxis
								dataKey="hour"
								type="number"
								domain={[0, 23]}
								ticks={[0, 3, 6, 9, 12, 15, 18, 21]}
								tickFormatter={(value) => String(value).padStart(2, "0")}
								tickLine={true}
								axisLine={true}
								tickMargin={5}
							/>
							<ChartTooltip
								cursor={true}
								content={<ChartTooltipContent indicator="dot" hideLabel />}
							/>
							<defs>
								<linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
									<stop
										offset="5%"
										stopColor="var(--color-hour)"
										stopOpacity={0.8}
									/>
									<stop
										offset="95%"
										stopColor="var(--color-hour)"
										stopOpacity={0.1}
									/>
								</linearGradient>
							</defs>
							<Area
								dataKey="amount"
								type="monotone"
								fill="url(#fillGradient)"
								fillOpacity={0.4}
								stroke="var(--color-hour)"
								stackId="a"
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
										+{difference} than previous hour{" "}
										<TrendingUp className="inline h-4 w-4" />
									</div>
								) : difference !== 0 ? (
									<div className="text-red-400">
										{difference} than previous hour{" "}
										<TrendingDown className="inline h-4 w-4" />
									</div>
								) : (
									<div className="text-gray-400">
										+{difference} than previous hour
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
					<CardTitle>Last 24 hours (UTC)</CardTitle>
					<CardDescription>
						Showing total messages for the last 24 hours
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center">Not enough data</div>
				</CardContent>
			</Card>
		);
	}
}
