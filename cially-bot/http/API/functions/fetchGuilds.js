const { debug } = require("../../../terminal/debug");
const { error } = require("../../../terminal/error");

const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);
const guild_collection_name = process.env.GUILD_COLLECTION;

async function fetchGuilds(req, res, client) {
	let success_message = { code: "success" };
	let error_message = { code: "error" };
	debug({ text: `Server Fetching Request Received` });

	try {
		let guilds_in_database = [];
		const guilds = await pb.collection(guild_collection_name).getFullList({});
		guilds.forEach((guild) => {
			guilds_in_database.push(guild.discordID);
		});

		try {
			let discord_guilds = client.guilds.cache;
			let guildsArray = [];
			discord_guilds.forEach(async (guild) => {
				let icon = await guild.iconURL();
				if (guilds_in_database.includes(guild.id)) {
					await guildsArray.push({
						name: guild.name,
						id: guild.id,
						icon: icon,
						in_db: true,
					});
				} else {
					await guildsArray.push({
						name: guild.name,
						id: guild.id,
						icon: icon,
						in_db: false,
					});
				}
			});

			// Do not remove this line bellow cause things will brake for some reason
			await debug({ text: `Completed Fetching Available Guilds` });

			res.send({ AvailableGuilds: guildsArray });
		} catch (err) {
			error({
				text: `Failed to communicate with the Discord API. /fetchGuilds`,
			});
			console.log(err);
			res.send(error_message);
		}
	} catch (err) {
		error({
			text: `Failed to communicate with the PocketBase Instance. /fetchGuilds`,
		});
		console.log(err);
		res.send(error_message);
	}
}

module.exports = { fetchGuilds };
