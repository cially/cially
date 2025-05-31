const { CronJob } = require("cron");
const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const { debug } = require("../terminal/debug");
const { error } = require("../terminal/error");

pb.autoCancellation(false);

async function organizeMessages() {
	try {
		const record = await pb
			.collection("messages")
			.getFirstListItem('guildID != "" && messageCreation != ""', {});

		if (!record) {
			console.log("No message item in the queue found");
			return;
		}

		const maxFetchAmount = 100;

		const creationDate = record.messageCreation;
		const date = creationDate.slice(0, 10);
		const hour = creationDate.slice(11, 13);
		const guildID = record.guildID;
		const startOfHour = `${date} ${hour}:00:00.000Z`;
		const endOfHour = `${date} ${hour}:59:59.999Z`;

		// {channel: amount}
		// {author: totalMessages, averageMessageLength}
		let channelArray = [];
		let authorArray = [];

		const channelID = record.channelID;
		const authorID = record.author;
		const messageLength = record.messageLength;

		console.log(`Got record: ${record.id} with date ${date} & time ${hour}.`);

		// Delete the record
		try {
			// Push the channel & author data first

			await pb.collection("messages").delete(record.id);

			console.log(`Deleted record: ${record.id}`);

			// Add the new hour data
			try {
				channelArray.push({ channel: channelID, amount: 1 });
				authorArray.push({
					author: authorID,
					amount: 1,
					totalLength: messageLength,
				});
				const timeRecord = await pb
					.collection("hourly_stats")
					.getFirstListItem(
						`guildID="${guildID}" && hour="${hour}" && date="${date}"`,
						{},
					);
				console.log(
					`Found already existing time record with ID: ${timeRecord.id}`,
				);

				const data = {
					guildID: record.guildID,
					hour: hour,
					date: date,
					messages: timeRecord.messages + 1,
				};

				await pb.collection("hourly_stats").update(timeRecord.id, data);
				console.log(`Pushed the new data to the hour item:`, data);

				// fetch other records with similar date & hour
				try {
					// Limit other records number to 100 for efficiency.
					const otherItemsList = await pb
						.collection("messages")
						.getList(1, maxFetchAmount, {
							filter: `guildID="${guildID}" && messageCreation >= "${startOfHour}" && messageCreation <= "${endOfHour}"`,
						});

					const totalItems = otherItemsList.items;
					const i = otherItemsList.items.length;
					if (i > 0) {
						console.log(`Found ${i} more items with the same date`);
						const data = {
							messages: timeRecord.messages + i + 1,
						};

						try {
							const batch = pb.createBatch();
							for (const item of totalItems) {
								const itemAuthorID = item.author;
								const itemChannelID = item.channelID;
								const itemLength = item.messageLength;
								const channelArrayPosition = channelArray.findIndex(
									(item) => item.channel === `${itemChannelID}`,
								);
								if (channelArrayPosition !== -1) {
									channelArray[channelArrayPosition].amount =
										channelArray[channelArrayPosition].amount + 1;
								} else {
									channelArray.push({ channel: itemChannelID, amount: 1 });
								}
								const authorArrayPosition = authorArray.findIndex(
									(item) => item.author === `${itemAuthorID}`,
								);
								if (authorArrayPosition !== -1) {
									authorArray[authorArrayPosition].amount =
										authorArray[authorArrayPosition].amount + 1;
									authorArray[authorArrayPosition].totalLength =
										authorArray[authorArrayPosition].totalLength + itemLength;
								} else {
									authorArray.push({
										author: itemAuthorID,
										amount: 1,
										totalLength: itemLength,
									});
								}

								batch.collection("messages").delete(item.id);
								console.log(`Deleted other item with id: ${item.id}`);
							}
							const result = await batch.send();
							console.log(`Batch deletion sent`);
						} catch (err) {
							// Failed to delete other items
							console.log(`error 6`, err);
						}

						await pb.collection("hourly_stats").update(timeRecord.id, data);
					} else {
						console.log("No more items on that date");
					}
				} catch (err) {
					if (err.status === 404) {
						console.log("No other items with the same date found");
					} else {
						console.log("err 4", err);
					}
				}
			} catch (err) {
				// Failed to find hour record
				if (err.status === 404) {
					const data = {
						guildID: guildID,
						hour: hour,
						date: date,
						messages: 1,
						joins: 0,
						leaves: 0,
						unique_users: 0,
					};
					const newHourItem = await pb.collection("hourly_stats").create(data);
					console.log(`Made a new hour item with id: ${newHourItem.id}`);
				} else {
					console.log("err 3", err);
				}
			}
		} catch (err) {
			// Failed to delete record
			console.log("err 2", err);
		}

		// Push channel stats
		if (channelArray.length > 0) {
			const guildID = record.guildID;
			for (const channel of channelArray) {
				try {
					const channelID = channel.channel;
					const pbChannel = await pb
						.collection("channel_stats")
						.getFirstListItem(
							`guildID="${guildID}" && channelID="${channelID}"`,
							{},
						);

					const data = {
						amount: pbChannel.amount + channel.amount,
					};

					await pb.collection("channel_stats").update(pbChannel.id, data);
				} catch (err) {
					if (err.status === 404) {
						const data = {
							channelID: channel.channel,
							guildID: record.guildID,
							amount: channel.amount,
						};

						await pb.collection("channel_stats").create(data);
					} else {
						console.log("err7", err);
					}
				}
			}
		}

		// Push user stats
		if (authorArray.length > 0) {
			const guildID = record.guildID;
			for (const author of authorArray) {
				try {
					const authorID = author.author;
					const pbUser = await pb
						.collection("user_stats")
						.getFirstListItem(
							`guildID="${guildID}" && authorID="${authorID}"`,
							{},
						);

					const data = {
						totalMessages: pbUser.amount + author.amount,
						totalMessageLength: pbUser.totalMessageLength + author.totalLength,
					};

					await pb.collection("user_stats").update(pbUser.id, data);
				} catch (err) {
					if (err.status === 404) {
						const data = {
							authorID: author.author,
							guildID: record.guildID,
							totalMessages: author.amount,
							totalMessageLength: author.totalLength,
						};

						await pb.collection("user_stats").create(data);
					} else {
						console.log("err7", err);
					}
				}
			}
		}
		console.log(`Author/Channel data updated succesfully`);
	} catch (err) {
		// Failed to find new record
		if (err.status === 404) {
			return;
		} else {
			console.log("error", err);
		}
	}
}

const messagesOrganizer = new CronJob(
	"*/10 * * * * *", // cronTime
	() => {
		organizeMessages();
	}, // onTick
	null, // onComplete
	true, // start
	null, // timeZone
	null, // context
	false, // runOnInit
	null, // utc offset
	null, // unref timeout
	true, // wait for completion
);

async function messageOrganizer() {
	messagesOrganizer.start();
	console.log("message organizer is running");
}

module.exports = { messageOrganizer };
