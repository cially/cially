import PocketBase from "pocketbase";

// Pocketbase Initialization
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const collection_name = process.env.MESSAGE_COLLECTION;
const guild_collection_name = process.env.GUILDS_COLLECTION;
const hourly_stats_collection = "hourly_stats"; // New collection name

// Main GET Event
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const fourWeeksAgoDate = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);
	const fourWeeksAgoDate_formatted = `${fourWeeksAgoDate.getUTCFullYear()}-${(fourWeeksAgoDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${fourWeeksAgoDate.getUTCDate().toString().padStart(2, "0")}`;

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
					filter: `guildID ?= "${guild.id}" && date='${todayDate_formatted}'`,
					sort: "hour",
				});

			// Transform hourly stats to match expected format and ensure all 24 hours are represented
			const hourData = [];
			for (let i = 0; i < 24; i++) {
				const hourString = i.toString().padStart(2, "0");
				const existingStat = hourlyStats.find(
					(stat) => stat.hour === hourString,
				);

				hourData.push({
					hour: hourString,
					amount: Number(existingStat?.messages) || 0,
					joins: Number(existingStat?.joins) || 0,
					leaves: Number(existingStat?.leaves) || 0,
					unique_users: Number(existingStat?.unique_users) || 0,
				});
			}

			// Get weekly data (current week starting from Monday)
			let weekData = [];
			const today = new Date();

			// Find the Monday of current week (0 = Sunday, 1 = Monday, etc.)
			const dayOfWeek = today.getUTCDay();
			const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days, otherwise go back (dayOfWeek - 1) days
			const mondayDate = new Date(
				today.getTime() - daysFromMonday * 24 * 60 * 60 * 1000,
			);

			// Get data for each day of the week (Monday to Sunday)
			for (let i = 0; i < 7; i++) {
				const currentDate = new Date(
					mondayDate.getTime() + i * 24 * 60 * 60 * 1000,
				);
				const currentDate_formatted = `${currentDate.getUTCFullYear()}-${(currentDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${currentDate.getUTCDate().toString().padStart(2, "0")}`;
				const displayDate = `${(currentDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${currentDate.getUTCDate().toString().padStart(2, "0")}`;

				// Get hourly stats for this day
				const dayStats = await pb
					.collection(hourly_stats_collection)
					.getFullList({
						filter: `guildID ?= "${guild.id}" && date='${currentDate_formatted}'`,
					});

				// Sum up the day's statistics
				const dayTotal = dayStats.reduce(
					(acc, stat) => ({
						messages: acc.messages + (Number(stat.messages) || 0),
						joins: acc.joins + (Number(stat.joins) || 0),
						leaves: acc.leaves + (Number(stat.leaves) || 0),
						unique_users: Math.max(
							acc.unique_users,
							Number(stat.unique_users) || 0,
						), // Take max for unique users
					}),
					{ messages: 0, joins: 0, leaves: 0, unique_users: 0 },
				);

				weekData.push({
					date: displayDate,
					amount: dayTotal.messages,
					joins: dayTotal.joins,
					leaves: dayTotal.leaves,
					unique_users: dayTotal.unique_users,
				});
			}

			// Get four week data (last 22 days, grouped by weeks)
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

				// Get stats for the week range
				const weekStats = await pb
					.collection(hourly_stats_collection)
					.getFullList({
						filter: `guildID ?= "${guild.id}" && date >= '${endingDate_formatted}' && date <= '${startingDate_formatted}'`,
					});

				// Sum up the week's statistics
				const weekTotal = weekStats.reduce(
					(acc, stat) => ({
						messages: acc.messages + (Number(stat.messages) || 0),
						joins: acc.joins + (Number(stat.joins) || 0),
						leaves: acc.leaves + (Number(stat.leaves) || 0),
						unique_users: Math.max(
							acc.unique_users,
							Number(stat.unique_users) || 0,
						),
					}),
					{ messages: 0, joins: 0, leaves: 0, unique_users: 0 },
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
					amount: weekTotal.messages,
					joins: weekTotal.joins,
					leaves: weekTotal.leaves,
					unique_users: weekTotal.unique_users,
				});
				w = w + 7;
			}
			fourWeekData = fourWeekData.toReversed();
			const totalMessages = await pb
				.collection("hourly_stats")
				.getFullList({
					filter: `guildID ?= "${guild.id}"`,
				})
				.then((hours) =>
					hours.reduce((sum, hour) => sum + (hour.messages || 0), 0),
				);

			// Get general data from guild collection
			const generalDataArray = [];
			generalDataArray.push({
				total_messages: totalMessages,
				message_deletions: guild.message_deletions,
				message_edits: guild.message_edits,
				total_attachments: guild.total_attachments,
			});

			const finalData = [];
			finalData.push({
				HourData: hourData,
				WeekData: weekData,
				FourWeekData: fourWeekData,
				GeneralData: generalDataArray,
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
		// Handle other errors
		const serverError = [{ errorCode: 500 }];
		console.log(err);
		return Response.json({ serverError });
	}
}
