const { debug } = require("../../../terminal/debug");
const { error } = require("../../../terminal/error");
const { registerGuild } = require("./logic/registerGuild");

const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = process.env.GUILD_COLLECTION;
const collection_name = process.env.INVITE_COLLECTION;

async function inviteCreate(req, res) {
	const body = req.body;

	const { guildID, channelID, authorID } = body;

	debug({ text: `New POST Request: \n${JSON.stringify(body)}` });

	const roger = {
		response: `Message Received with the following details: GI: ${guildID}`,
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
		debug({ text: ` Guild has been found and is ready to add data to it` });

		try {
			const itemData = {
				guildID: guild.id,
				channelID: channelID,
				authorID: authorID,
			};
			await pb.collection(collection_name).create(itemData);
			debug({ text: ` Invite has been added in the database` });
		} catch (error) {
			console.log(error);
		}
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
		text: `End of logic. Stopping the communication and returning a response to the Bot`,
	});

	return res.status(201).json(roger);
}

module.exports = { inviteCreate };
