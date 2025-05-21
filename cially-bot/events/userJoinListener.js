// Imports
const { Events } = require("discord.js");
const cfonts = require("cfonts");
const { debug } = require("../terminal/debug");
const { error } = require("../terminal/error");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const { sendPostRequest } = require("../http/postRequest");

const debugging_status = process.env.DEBUGGING;

// Main Event
module.exports = {
	name: Events.GuildMemberAdd,
	execute(member) {
		// Logs
		debug({
			text: `User Joined: \nGuild: ${member.guild.name}, ${member.guild.id}, Members: ${member.guild.memberCount}\nMember: ${member.id}, ${member.displayName}`,
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
