import PocketBase from "pocketbase";
import { hourData } from "./_lazy-import/hourdata";

// Pocketbase Initialization
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const collection_name = process.env.MESSAGE_COLLECTION;
const guild_collection_name = process.env.GUILDS_COLLECTION;

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
			const messagesArray = [];

			const fourWeeksMessagesLog = await pb
				.collection(collection_name)
				.getFullList({
					filter: `guildID ?= "${guild.id}" && created>'${fourWeeksAgoDate_formatted}'`,
					sort: "created",
				});

			for (const message of fourWeeksMessagesLog) {
				const creation_date = String(message.created).slice(0, 19);
				const creation_date_js = new Date(
					Date.UTC(
						Number.parseInt(creation_date.slice(0, 4)),
						Number.parseInt(creation_date.slice(5, 7)) - 1,
						Number.parseInt(creation_date.slice(8, 10)),
					),
				);

				const creation_date_js_ms = creation_date_js.getTime();

				messagesArray.push({
					message_id: message.id,
					author: message.author,
					channelID: `${message.channelID}`,
					created: creation_date_js_ms,
					created_formatted: creation_date,
				});
			}

			const todayMessages = [];
			const todayDate = new Date();
			const todayDateUTC = new Date(
				Date.UTC(
					todayDate.getUTCFullYear(),
					todayDate.getUTCMonth(),
					todayDate.getUTCDate(),
				),
			);
			const todayDate_ms = todayDateUTC.getTime();

			for (const message of messagesArray) {
				if (message.created === todayDate_ms) {
					todayMessages.push({
						message_id: message.id,
						author: message.author,
						channelID: `${message.channelID}`,
						created: message.created,
						created_formatted: message.created_formatted,
					});
				}
			}

			for (const record of todayMessages) {
				const minutes = [record.created_formatted.slice(11, 13)];
				for (const minute of minutes) {
					const position = hourData.findIndex((item) => item.hour === minute);
					if (position !== -1) {
						hourData[position].amount = hourData[position].amount + 1;
					} else {
						hourData.push({ hour: minute, amount: 1 });
					}
				}
			}

			hourData.sort((a, b) => a.hour - b.hour);

			const monthlyMessages = [];
			const LastWeekDateUTC = new Date(
				Date.UTC(
					todayDate.getUTCFullYear(),
					todayDate.getUTCMonth() - 1,
					todayDate.getUTCDate(),
				),
			);
			const LastWeekDateUTC_ms = LastWeekDateUTC.getTime();

			for (const message of messagesArray) {
				if (message.created >= LastWeekDateUTC_ms) {
					monthlyMessages.push({
						message_id: message.id,
						author: message.author,
						channelID: `${message.channelID}`,
						created: message.created,
						created_formatted: message.created_formatted,
					});
				}
			}

			let weekData = [];

			let u = 0;

			while (u < 8) {
				const uDaysAgoDate = new Date(Date.now() - u * 24 * 60 * 60 * 1000);
				const uDaysAgoDate_formatted = `${(uDaysAgoDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${uDaysAgoDate.getUTCDate().toString().padStart(2, "0")}`;
				weekData.push({ date: `${uDaysAgoDate_formatted}`, amount: 0 });
				u = u + 1;
			}

			for (const record of monthlyMessages) {
				const monthly_msgs = [record.created_formatted.slice(5, 10)];
				for (const monthly_msg of monthly_msgs) {
					const position = weekData.findIndex(
						(item) => item.date === monthly_msg,
					);
					if (position !== -1) {
						weekData[position].amount = weekData[position].amount + 1;
					}
				}
			}
			weekData = weekData.toReversed();

			console.log("oioioi");

			let fourWeekData = [];

			let w = 0;
			while (w < 22) {
				const startingDate = new Date(Date.now() - w * 24 * 60 * 60 * 1000);
				const startingDate_formatted = `${startingDate.getUTCFullYear().toString().padStart(2, "0")}-${(startingDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${startingDate.getUTCDate().toString().padStart(2, "0")}`;
				const startingDate_ms = startingDate.getTime();
				const startingDate_factor = startingDate.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				});

				const endingDate = new Date(Date.now() - (7 + w) * 24 * 60 * 60 * 1000);
				const endingDate_formatted = `${endingDate.getUTCFullYear().toString().padStart(2, "0")}-${(endingDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${endingDate.getUTCDate().toString().padStart(2, "0")}`;
				const endingDate_ms = endingDate.getTime();

				fourWeekData.push({
					factor: `${startingDate_factor}`,
					starting_date: { startingDate_formatted, startingDate_ms },
					finishing_date: { endingDate_formatted, endingDate_ms },
					amount: 0,
				});
				w = w + 7;
			}

			for (const record of monthlyMessages) {
				const creation_date = new Date(record.created_formatted.slice(0, 10));
				const creation_date_ms = creation_date.getTime();
				const position = fourWeekData.findIndex(
					(item) =>
						item.starting_date.startingDate_ms >= creation_date_ms &&
						item.finishing_date.endingDate_ms <= creation_date_ms,
				);
				if (position !== -1) {
					fourWeekData[position].amount = fourWeekData[position].amount + 1;
				} else {
					return;
				}
			}
			fourWeekData = fourWeekData.toReversed();

			const generalDataArray = [];
			generalDataArray.push({
				total_messages: guild.total_messages,
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
	}
}
