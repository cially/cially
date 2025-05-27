const { debug } = require("../../../terminal/debug");
const { error } = require("../../../terminal/error");

const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);
const guild_collection_name = process.env.GUILD_COLLECTION;
const collection_name = process.env.MESSAGE_COLLECTION;
const { registerGuild } = require("./logic/registerGuild");
const { retryRequest } = require("./logic/retryRequest");

// Disabled Auto Cancellation because of issues when multiple messages are being sent
pb.autoCancellation(false);

async function messageCreate(req, res) {
	const body = req.body;
	const {
		guildID,
		messageID,
		messageLength,
		channelID,
		authorID,
		attachments,
	} = body;

	debug({ text: `New POST req: \n${JSON.stringify(body)}` });

	const roger = {
		res: `Message Received with the following details: GI: ${guildID}, MI: ${messageID}`,
	};

	try {
		const guild = await retryRequest(() =>
			pb
				.collection(guild_collection_name)
				.getFirstListItem(`discordID='${guildID}'`, {}),
		);

		debug({ text: `Guild has been found and is ready to add data to it` });

		debug({
			text: `Guild Data Item has been found and is ready to add data to it`,
		});

		const currentPocketBaseDate = () => {
			const date = new Date();

			const pad = (num, size = 2) => String(num).padStart(size, "0");

			const year = date.getUTCFullYear();
			const month = pad(date.getUTCMonth() + 1);
			const day = pad(date.getUTCDate());
			const hours = pad(date.getUTCHours());
			const minutes = pad(date.getUTCMinutes());
			const seconds = pad(date.getUTCSeconds());
			const milliseconds = pad(date.getUTCMilliseconds(), 3);

			return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}Z`;
		};

		const itemData = {
			author: authorID,
			guildID: guild.id,
			channelID: channelID,
			messageLength: messageLength,
			messageID: messageID,
			messageCreation: currentPocketBaseDate(),
		};

		await retryRequest(() => pb.collection(collection_name).create(itemData));

		debug({
			text: `Message has been added in the database. ID: ${messageID}`,
		});

		const new_general_data = {
			total_messages: guild.total_messages + 1,
			total_attachments: guild.total_attachments + attachments,
		};

		await retryRequest(() =>
			pb.collection(guild_collection_name).update(guild.id, new_general_data),
		);

		debug({
			text: `General Guild Data has been updated in the database`,
		});
	} catch (err) {
		if (err.status === 404) {
			registerGuild(guildID);
		} else {
			debug({ text: `Failed to communicate with the Database: \n${err}` });
			error({ text: `[ERROR] Error Code: ${err.status}` });
		}
	}

	debug({
		text: `End of logic. Stopping the communication and returning a res to the Bot`,
	});

	return res.status(201).json(roger);
}

module.exports = { messageCreate };
