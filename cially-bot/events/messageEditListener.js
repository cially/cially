// Imports
const { Events } = require("discord.js");
const cfonts = require("cfonts");
const { debug } = require("../terminal/debug");
const { error } = require("../terminal/error");
const { sendPostRequest } = require("../http/postRequest");

// Event
module.exports = {
	name: Events.Raw,
	once: false,
	execute(packet, client) {
		if (packet.t !== "MESSAGE_UPDATE") return;
		debug({ text: `Message Got Edited. Fetching Guild...` });

		try {
			const guildID = packet.d.guild_id;
			debug({ text: `Fetched Guild. Message Edit on Guild: ${guildID}` });

			const info = {
				guildID: guildID,
			};

			sendPostRequest({
				data: info,
				guildId: guildID,
				type: "messageEdit",
			});
		} catch (err) {
			error({
				text: `Failed to save Message Deletion in the DB. Error: ${err}`,
			});
		}
	},
};
