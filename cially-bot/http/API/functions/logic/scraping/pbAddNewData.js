const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);
const guild_collection_name = process.env.GUILD_COLLECTION;
const collection_name = process.env.MESSAGE_COLLECTION;
const { debug } = require("../../../../../terminal/debug");
const { error } = require("../../../../../terminal/error");

async function bulkAddition() {
	let batch = pb.createBatch();
	let i = 1;
	for await (let message of data) {
		message = {
			messageID: message.messageID,
			author: message.author,
			guildID: guild.id,
			messageLength: message.messageLength,
			channelID: message.channelID,
			messageCreation: message.created,
		};
		if (i < 20000) {
			batch.collection(collection_name).create(message);
			i = i + 1;
		} else {
			await batch.send();
			debug({ text: `Max batch capacity reached. Creating a new batch...` });
			batch = pb.createBatch();
			batch.collection(collection_name).create(message);
			i = 1;
		}
	}

	debug({ text: `Batch is ready to be sent` });

	return await batch.send();
}

async function pbAddNewData({ guildID }) {
	try {
		const guild = await pb
			.collection(guild_collection_name)
			.getFirstListItem(`discordID?="${guildID}"`, {});

		debug({ text: `Guild found. Ready to add new data items` });
		bulkAddition();
	} catch (err) {
		error({ text: `Something went wrong after attempting to add message items into the database` });
		console.log(err);
	}
}

module.exports = { pbAddNewData };
