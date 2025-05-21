const { debug } = require("../../../terminal/debug");
const { error } = require("../../../terminal/error");

async function fetchID(req, res, client) {
	const success_message = { code: "success" };
	const error_message = { code: "error" };
	const body = req.body;
	const guildID = req.params.guildID;

	debug({ text: `ID Fetching Request Received for Guild ID: ${guildID}` });

	try {
		const channels = body[0].channels;
		const users = body[0].users;
		const newArray = { newChannels: [], newUsers: [] };
		const guild = client.guilds.cache.get(`${String(guildID)}`);

		channels.forEach(async (channel) => {
			try {
				const discordChannel = await client.channels.fetch(channel);
				newArray.newChannels.push({
					id: channel,
					name: `${discordChannel.name}`,
				});
				debug({ text: `Added Succesfully Channel: ${channel}` });
			} catch (err) {
				debug({ text: `Failed to add Channel: ${channel}` });
			}
		});

		users.forEach(async (user) => {
			try {
				const discordUser = client.users.cache.get(user);
				newArray.newUsers.push({ id: user, name: discordUser.username });
				debug({ text: `Added Succesfully User: ${user}` });
			} catch (err) {
				debug({ text: `Failed to add User: ${user}` });
			}
		});

		// I dont know why, but without this debug line things break
		// Please do not remove :)
		await debug({ text: `IDs fetched. Ready to send response` });

		await res.send(newArray);
	} catch (err) {
		error({
			text: `Failed to communicate with the Discord API. /fetchID${guildID}`,
		});
		console.log(err);
		res.send(error_message);
	}
}

module.exports = { fetchID };
