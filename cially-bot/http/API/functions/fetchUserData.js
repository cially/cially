const { debug } = require("../../../terminal/debug");
const { error } = require("../../../terminal/error");

async function fetchUserData(req, res, client) {
	const success_message = { code: "success" };
	const error_message = { code: "error" };
	const body = req.body;
	const guildID = req.params.guildID;
	// const userId = "1095304752495083521"; // Used for testing
	const userId = body[0].userID;
	// const channeID = "1365959627312857188"; // Used for testing
	const channelID = body[0].channelID

	console.log("Guild ID: %s, User ID: %s, Channel ID: %s", guildID, userId, channelID);
	const dataArray = [];

	debug({
		text: `User Data Fetching Request Received for Guild ID: ${guildID}`,
	});

	try {
		const user = await client.users.fetch(userId);

		dataArray.push({
			username: user.username,
			globalName: user.globalName,
			avatar: user.displayAvatarURL(),
			creationDate: user.createdAt,
		});

		try {
			const discordChannel = await client.channels.fetch(channelID);

			dataArray.push({ channel: { id: channelID, name: discordChannel.name } });

			await debug({ text: `User Data fetched. Ready to send response` });

			await res.send(dataArray);
		} catch (err) {
			await debug({ text: `Failed to fetch Channel Name` });
			dataArray.push({ channel: { id: channelID, name: channelID } });
			await res.send(dataArray);
		}
	} catch (err) {
		await debug({ text: `Failed to fetch User Data` });
		res.send(error_message);
	}
}

module.exports = { fetchUserData };
