import PocketBase from "pocketbase";

// Pocketbase Initialization
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = process.env.GUILDS_COLLECTION;
const hourly_stats_collection = "hourly_stats";

// Main GET Event
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	try {
		const guild = await pb
			.collection(guild_collection_name)
			.getFirstListItem(`discordID='${id}'`, {});

		try {
			// Get hourly stats for today
			const todayDate = new Date();
			const todayDate_formatted = `${todayDate.getUTCFullYear()}-${(todayDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${todayDate.getUTCDate().toString().padStart(2, "0")}`;

			const hourlyStats = await pb
				.collection(hourly_stats_collection)
				.getFullList({
					filter: `guildID = "${guild.id}" && date = "${todayDate_formatted}"`,
					sort: "hour",
				});

			const hourData = [];
			for (let i = 0; i < 24; i++) {
				const hourString = i.toString().padStart(2, "0");
				const existingStat = hourlyStats.find(
					(stat) => stat.hour === hourString,
				);

				hourData.push({
					hour: hourString,
					joins: Number(existingStat?.joins) || 0,
					leaves: Number(existingStat?.leaves) || 0,
					unique_users: Number(existingStat?.unique_users) || 0,
				});
			}

			const weekData = [];
			const today = new Date();

			for (let i = 6; i >= 0; i--) {
				const currentDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
				const currentDate_formatted = `${currentDate.getUTCFullYear()}-${(currentDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${currentDate.getUTCDate().toString().padStart(2, "0")}`;
				const displayDate = `${(currentDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${currentDate.getUTCDate().toString().padStart(2, "0")}`;

				const dayStats = await pb
					.collection(hourly_stats_collection)
					.getFullList({
						filter: `guildID = "${guild.id}" && date = "${currentDate_formatted}"`,
					});

				const dayTotal = dayStats.reduce(
					(acc, stat) => ({
						joins: acc.joins + (Number(stat.joins) || 0),
						leaves: acc.leaves + (Number(stat.leaves) || 0),
						unique_users: Math.max(
							acc.unique_users,
							Number(stat.unique_users) || 0,
						),
					}),
					{ joins: 0, leaves: 0, unique_users: 0 },
				);

				weekData.push({
					date: displayDate,
					joins: dayTotal.joins,
					leaves: dayTotal.leaves,
					unique_users: dayTotal.unique_users,
				});
			}

			let fourWeekData = [];
			let w = 0;

			while (w < 22) {
				const startingDate = new Date(Date.now() - w * 24 * 60 * 60 * 1000);
				const startingDate_formatted = `${startingDate.getUTCFullYear()}-${(startingDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${startingDate.getUTCDate().toString().padStart(2, "0")}`;
				const startingDate_factor = startingDate.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				});

				const endingDate = new Date(Date.now() - (7 + w) * 24 * 60 * 60 * 1000);
				const endingDate_formatted = `${endingDate.getUTCFullYear()}-${(endingDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${endingDate.getUTCDate().toString().padStart(2, "0")}`;

				const weekStats = await pb
					.collection(hourly_stats_collection)
					.getFullList({
						filter: `guildID = "${guild.id}" && date >= "${endingDate_formatted}" && date <= "${startingDate_formatted}"`,
					});

				const weekTotal = weekStats.reduce(
					(acc, stat) => ({
						joins: acc.joins + (Number(stat.joins) || 0),
						leaves: acc.leaves + (Number(stat.leaves) || 0),
						unique_users: Math.max(
							acc.unique_users,
							Number(stat.unique_users) || 0,
						),
					}),
					{ joins: 0, leaves: 0, unique_users: 0 },
				);

				fourWeekData.push({
					factor: startingDate_factor,
					starting_date: {
						startingDate_formatted,
						startingDate_ms: startingDate.getTime(),
					},
					finishing_date: {
						endingDate_formatted,
						endingDate_ms: endingDate.getTime(),
					},
					joins: weekTotal.joins,
					leaves: weekTotal.leaves,
					unique_users: weekTotal.unique_users,
				});
				w = w + 7;
			}
			fourWeekData = fourWeekData.toReversed();

			const calculateGeneralStats = (data, period) => {
				const totals = data.reduce(
					(acc, item) => ({
						joins: acc.joins + item.joins,
						leaves: acc.leaves + item.leaves,
						unique_users: acc.unique_users + item.unique_users,
					}),
					{ joins: 0, leaves: 0, unique_users: 0 },
				);

				const joinToLeaveRatio =
					totals.leaves > 0
						? (totals.joins / totals.leaves).toFixed(2)
						: totals.joins > 0
							? "∞"
							: "0";
				const joinToUniqueRatio =
					totals.unique_users > 0
						? (totals.joins / totals.unique_users).toFixed(2)
						: totals.joins > 0
							? "∞"
							: "0";
				const leaveToUniqueRatio =
					totals.unique_users > 0
						? (totals.leaves / totals.unique_users).toFixed(2)
						: totals.leaves > 0
							? "∞"
							: "0";
				const netGrowth = totals.joins - totals.leaves;
				const averageJoinsPerDay =
					period === "today"
						? totals.joins
						: (totals.joins / data.length).toFixed(2);
				const averageLeavesPerDay =
					period === "today"
						? totals.leaves
						: (totals.leaves / data.length).toFixed(2);
				const averageUniqueUsersPerDay =
					period === "today"
						? totals.unique_users
						: (totals.unique_users / data.length).toFixed(2);

				return {
					period,
					total_joins: totals.joins,
					total_leaves: totals.leaves,
					total_unique_users: totals.unique_users,
					net_growth: netGrowth,
					join_to_leave_ratio: joinToLeaveRatio,
					join_to_unique_ratio: joinToUniqueRatio,
					leave_to_unique_ratio: leaveToUniqueRatio,
					average_joins_per_day: averageJoinsPerDay,
					average_leaves_per_day: averageLeavesPerDay,
					average_unique_users_per_day: averageUniqueUsersPerDay,
					retention_rate:
						totals.joins > 0
							? `${(
									((totals.joins - totals.leaves) / totals.joins) * 100
								).toFixed(2)}%`
							: "0%",
				};
			};

			const generalData = [
				calculateGeneralStats(hourData, "today"),
				calculateGeneralStats(weekData, "week"),
				calculateGeneralStats(fourWeekData, "month"),
			];

			const allHourlyStats = await pb
				.collection(hourly_stats_collection)
				.getFullList({
					filter: `guildID = "${guild.id}"`,
					sort: "hour",
				});

			const hourlyTotals = [];
			for (let i = 0; i < 24; i++) {
				const hourString = i.toString().padStart(2, "0");

				const hourStats = allHourlyStats.filter(
					(stat) => stat.hour === hourString,
				);
				const hourTotal = hourStats.reduce(
					(acc, stat) => ({
						joins: acc.joins + (Number(stat.joins) || 0),
						leaves: acc.leaves + (Number(stat.leaves) || 0),
						unique_users: acc.unique_users + (Number(stat.unique_users) || 0),
					}),
					{ joins: 0, leaves: 0, unique_users: 0 },
				);

				hourlyTotals.push({
					hour: `${hourString}:00`,
					joins: hourTotal.joins,
					leaves: hourTotal.leaves,
					unique_users: hourTotal.unique_users,
					net: hourTotal.joins - hourTotal.leaves,
				});
			}

			const finalData = [];
			finalData.push({
				HourData: hourData,
				WeekData: weekData,
				FourWeekData: fourWeekData,
				GeneralData: generalData,
				HourlyTotals: hourlyTotals,
			});

			return Response.json({ finalData });
		} catch (err) {
			const notFound = [{ errorCode: 404 }];
			console.log(err);
			return Response.json({ notFound });
		}
	} catch (err) {
		if (err.status === 400) {
			const notFound = [{ errorCode: 404 }];
			console.log(err);
			return Response.json({ notFound });
		}
		const serverError = [{ errorCode: 500 }];
		console.log(err);
		return Response.json({ serverError });
	}
}
