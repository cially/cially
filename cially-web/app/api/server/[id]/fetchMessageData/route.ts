import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = "guilds";
const hourly_stats_collection = "hourly_stats";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	try {
		const guild = await pb
			.collection(guild_collection_name)
			.getFirstListItem(`discordID='${id}'`, {});

		try {
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
					amount: Number(existingStat?.messages) || 0,
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
						messages: acc.messages + (Number(stat.messages) || 0),
					}),
					{ messages: 0 },
				);

				weekData.push({
					date: displayDate,
					amount: dayTotal.messages,
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
						messages: acc.messages + (Number(stat.messages) || 0),
					}),
					{ messages: 0 },
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
				});
				w = w + 7;
			}
			fourWeekData = fourWeekData.toReversed();

			const totalMessages = await pb
				.collection("hourly_stats")
				.getFullList({
					filter: `guildID = "${guild.id}"`,
				})
				.then((hours) =>
					hours.reduce((sum, hour) => sum + (hour.messages || 0), 0),
				);

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
		const serverError = [{ errorCode: 500 }];
		console.log(err);
		return Response.json({ serverError });
	}
}
