const { Events } = require("discord.js");
const { debug } = require("../terminal/debug");
const { sendPostRequest } = require("../http/postRequest");

module.exports = {
	name: Events.GuildMemberRemove,
	execute(member) {
		debug({
			text: `User Left: \nGuild: ${member.guild.name}, ${member.guild.id} Members: ${member.guild.memberCount}\nMember: ${member.id}, ${member.displayName}`,
		});

		const info = {
			guildID: member.guild.id,
			memberID: member.id,
			memberCount: member.guild.memberCount,
		};

		sendPostRequest({
			data: info,
			guildId: member.guild.id,
			type: module.exports.name,
		});
	},
};
