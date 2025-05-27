const { debug } = require("../../../terminal/debug");
const { error } = require("../../../terminal/error");

const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);
const guild_collection_name = process.env.GUILD_COLLECTION;

async function syncGuild(req, res, client) {
	const success_message = { code: "success" };
	const error_message = { code: "error" };

	const guildID = req.params.guildID;

	debug({ text: `Syncronization Request Received for Guild ID: ${guildID}` });

	async function fetchGuilds() {
		try {
			const guilds = await pb.collection(guild_collection_name).getFullList({
				filter: `discordID ?= '${guildID}'`,
			});

			if (guilds.length > 0) {
				guilds.forEach((guild) => {
					async function setNewData() {
						const Guild = client.guilds.cache.get(`${String(guild.discordID)}`);
						const channels = Guild.channels.cache.size;
						const roles = Guild.roles.cache.size;
						const bans = Guild.bans.cache.size;
						const owner = await Guild.fetchOwner();
						const icon_url = await Guild.iconURL();
						const vanity_url = Guild.vanityURLCode;

						await Guild.members.fetch();
						const statusCount = {
							online: 0,
							idle: 0,
							dnd: 0,
							offline: 0,
						};

						Guild.members.cache.forEach((member) => {
							const status = member.presence?.status || "offline";
							if (statusCount[status] !== undefined) {
								statusCount[status]++;
							}
						});

						function fetchVanityData() {
							return Guild.fetchVanityData()
								.then((res) => {
									return res.uses;
								})
								.catch((err) => {
									return -1;
								});
						}
						const vanity_uses = await fetchVanityData();

						debug({ text: `Syncing Guild: ${Guild.name}, ${Guild.id}` });
						const newData = {
							name: Guild.name,
							members: Guild.memberCount,
							available: Guild.available,
							discord_partner: Guild.partnered,
							channels: channels,
							roles: roles,
							bans: bans,
							creation_date: Guild.createdAt,
							owner_username: owner.user.username,
							icon_url: icon_url,
							description: Guild.description,
							vanity_url: vanity_url,
							vanity_uses: vanity_uses,
							online: statusCount.online + statusCount.dnd,
							offline: statusCount.offline,
							idle: statusCount.idle,
						};
						try {
							await pb.collection("guilds").update(`${guild.id}`, newData);
							debug({
								text: `Guild got synced: ${Guild.name}, ${Guild.id}`,
							});
						} catch (err) {
							error({ text: `Failed to push new data: \n${err}` });
						}
					}

					// Check to see if the bot is in the guild
					if (guild.discordID) {
						try {
							setNewData();
							res.send(success_message);
						} catch (err) {
							error({
								text: `Failed to sync data for GuildID: ${Guild.id}\n${err}`,
							});
							res.send(error_message);
						}
					}
				});
			} else {
				debug({
					text: `Failed to fetch guild with ID: ${guildID}`,
				});
				res.send(error_message);
			}
		} catch (err) {
			error({ text: `Failed to fetch guild: \n${err}` });
		}
	}

	try {
		fetchGuilds();
	} catch (err) {
		console.log(err);
		error({ text: `Failed to communicate with the Database` });
		res.send(error_message);
	}
}

module.exports = { syncGuild };
