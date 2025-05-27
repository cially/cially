const get = require("simple-get");

const { debug } = require("../../../../terminal/debug");
const { error } = require("../../../../terminal/error");

const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = process.env.GUILD_COLLECTION;
const API_URL = process.env.API_URL;

async function registerGuild(guildID) {
	debug({ text: `Guild is not in the database. Attempting to add it...` });

	const guildData = { discordID: guildID };
	try {
		await pb.collection(guild_collection_name).create(guildData);
		debug({ text: `Guild has been added to the database` });

		try {
			// Load request options through event parameters
			const opts = {
				url: `${API_URL}/syncGuild/${guildID}/`,
			};

			// HTTP Request
			get.get(opts, (res) => {
				try {
					res.pipe(process.stdout);

					// Wait for API Response
					res.on("data", () => {
						debug({ text: `Response received and HTTP communication ended` });
					});
				} catch (err) {
					if (
						String(err.message).includes(
							`Cannot read properties of undefined (reading 'pipe')`,
						)
					) {
						error({
							text:
								`Looks like the bot can't communicate with ` +
								opts.url.blue +
								`\n  Check that you provided the correct URL and that the API is online and accessible.`,
						});
					} else {
						error({
							text: `Something went wrong while trying to communicate with the API: \n${err}`,
						});
					}
				}
			});
		} catch (err) {
			error({
				text: `Something went wrong while trying to communicate with the API: \n${err}`,
			});
		}
	} catch (error) {
		debug({ text: `Failed to create new guild: \n${error}` });
	}
}

module.exports = { registerGuild };
