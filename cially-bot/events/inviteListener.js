const { Events } = require("discord.js");
const { debug } = require("../terminal/debug");
const { sendPostRequest } = require("../http/postRequest");

module.exports = {
	name: Events.InviteCreate,
	execute(invite) {
		debug({
			text: `New Invite Created: \nGuild: ${invite.guild.name}, ${invite.guild}\nChannel: ${invite.channel.name}, ${invite.channelId}\nInviter: ${invite.inviterId}\n`,
		});

		const info = {
			guildID: invite.guild.id,
			channelID: invite.channelId,
			authorID: invite.inviterId,
		};
		sendPostRequest({
			data: info,
			guildId: invite.guild.id,
			type: module.exports.name,
		});
	},
};
