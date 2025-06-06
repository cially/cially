import {
	Activity,
	Columns,
	Columns2,
	Columns3,
	EqualApproximately,
	LandPlot,
	TrendingDown,
	TrendingUp,
	UserMinus,
	UserPlus,
	Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PeriodData = {
	period: string;
	total_joins: number;
	total_leaves: number;
	total_unique_users: number;
	net_growth: number;
	join_to_leave_ratio: number;
	retention_rate: number;
	average_joins_per_day: number;
	average_leaves_per_day: number;
	join_to_unique_ratio: number;
};

type StatCardProps = {
	icon: React.ElementType;
	label: string;
	value: number | string;
	isNetGrowth?: boolean;
};

const StatCard = ({
	icon: Icon,
	label,
	value,
	isNetGrowth = false,
}: StatCardProps) => (
	<div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
		<Icon className="h-4 w-4 text-white" />
		<div className="flex-1">
			<div className="text-xs text-white/60">{label}</div>
			<div
				className={`font-semibold ${
					isNetGrowth
						? value.toString().startsWith("+")
							? "text-green-400"
							: value.toString().startsWith("-")
							? "text-red-400"
							: "text-white"
						: "text-white"
				}`}
			>
				{value}
			</div>
		</div>
	</div>
);

const PeriodContent = ({ data }: { data: PeriodData }) => (
	<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
		<StatCard icon={UserPlus} label="Total Joins" value={data.total_joins.toLocaleString()} />
		<StatCard icon={UserMinus} label="Total Leaves" value={data.total_leaves.toLocaleString()} />
		<StatCard icon={Users} label="Unique Users" value={data.total_unique_users.toLocaleString()} />
		<StatCard
			icon={data.net_growth >= 0 ? TrendingUp : TrendingDown}
			label="Growth"
			value={`${data.net_growth >= 0 ? "+" : ""}${data.net_growth.toLocaleString()}`}
			isNetGrowth={true}
		/>
		<StatCard icon={EqualApproximately} label="Join/Leave Ratio" value={data.join_to_leave_ratio} />
		<StatCard icon={LandPlot} label="Retention Rate" value={data.retention_rate} />
		<StatCard icon={Activity} label="Avg Joins/Day" value={data.average_joins_per_day} />
		<StatCard icon={Activity} label="Avg Leaves/Day" value={data.average_leaves_per_day} />
		<div className="col-span-2 sm:col-span-1">
			<StatCard icon={Activity} label="Join/User Ratio" value={data.join_to_unique_ratio} />
		</div>
	</div>
);

export default function GeneralMessageDataCard({
	generalData,
}: {
	generalData?: PeriodData[];
}) {
	if (!generalData) {
		return (
			<Card className="mt-10 grid auto-rows-auto px-10 py-6 sm:min-w-dvh">
				<div>
					<div className="text-xl font-semibold">
						<Activity className="inline mr-2" />
						General Data
					</div>
					<div className="font-sans text-sm mt-1 text-white/60">
						More insights regarding user activity and engagement
					</div>
				</div>
				<Skeleton className="w-full h-32 mt-4" />
			</Card>
		);
	}

	try {
		const todayData = generalData.find((data) => data.period === "today");
		const weekData = generalData.find((data) => data.period === "week");
		const monthData = generalData.find((data) => data.period === "month");

		return (
			<Card className="mt-10 px-6 py-6 sm:min-w-dvh">
				<div className="mb-6">
					<div className="text-xl font-semibold">
						<Activity className="inline mr-2" />
						General Data
					</div>
					<div className="font-sans text-sm mt-1 text-white/60">
						More insights regarding user activity and engagement
					</div>
				</div>

				<Tabs defaultValue="today" className="w-full">
					<TabsList className="grid w-full grid-cols-3 mb-6">
						<TabsTrigger value="today" className="flex items-center gap-2">
							<Columns className="h-4 w-4" />
							Today
						</TabsTrigger>
						<TabsTrigger value="week" className="flex items-center gap-2">
							<Columns2 className="h-4 w-4" />
							Week
						</TabsTrigger>
						<TabsTrigger value="month" className="flex items-center gap-2">
							<Columns3 className="h-4 w-4" />
							Month
						</TabsTrigger>
					</TabsList>

					{todayData && (
						<TabsContent value="today" className="space-y-4">
							<div className="text-lg font-medium text-white/90">Today's Activity</div>
							<PeriodContent data={todayData} />
						</TabsContent>
					)}

					{weekData && (
						<TabsContent value="week" className="space-y-4">
							<div className="text-lg font-medium text-white/90">Weekly Summary</div>
							<PeriodContent data={weekData} />
						</TabsContent>
					)}

					{monthData && (
						<TabsContent value="month" className="space-y-4">
							<div className="text-lg font-medium text-white/90">Monthly Overview</div>
							<PeriodContent data={monthData} />
						</TabsContent>
					)}
				</Tabs>
			</Card>
		);
	} catch (err) {
		console.error("Error rendering general data:", err);
		return (
			<Card className="mt-10 grid auto-rows-auto px-10 py-6 sm:min-w-dvh">
				<div>
					<div className="text-xl font-semibold">
						<Activity className="inline mr-2" />
						General Data
					</div>
					<div className="font-sans text-sm mt-1 text-white/60">
						More insights regarding user activity and engagement
					</div>
				</div>
				<div className="text-center py-8 text-white/60">Not enough data available</div>
			</Card>
		);
	}
}
