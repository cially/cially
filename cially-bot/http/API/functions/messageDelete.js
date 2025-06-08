const { debug } = require("../../../terminal/debug");
const { error } = require("../../../terminal/error");
const { registerGuild } = require("./logic/registerGuild");

const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = process.env.GUILD_COLLECTION;

async function messageDelete(req, res) {
	const body = req.body;
	const { guildID } = body;

	debug({ text: `New POST req: \n${JSON.stringify(body)}` });

	const roger = {
		res: `Message Deletion Received with the following details: GI: ${guildID}`,
	};

	// Database Logic
	try {
		await pb
			.collection("_superusers")
			.authWithPassword(
				process.env.POCKETBASE_ADMIN_EMAIL,
				process.env.POCKETBASE_ADMIN_PASSWORD,
			);
		const guild = await pb
			.collection(guild_collection_name)
			.getFirstListItem(`discordID='${guildID}'`, {});
		debug({ text: `Guild has been found and is ready to add data to it` });

		const new_general_data = {
			message_deletions: guild.message_deletions + 1,
		};

		await pb
			.collection(`${guild_collection_name}`)
			.update(`${guild.id}`, new_general_data);
		debug({
			text: `General Guild Data has been updated in the database`,
		});
	} catch (err) {
		// 404 error -> guild is not on the database. Attempt to add it
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

module.exports = { messageDelete };
