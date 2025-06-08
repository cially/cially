const { SlashCommandBuilder } = require("discord.js");
const { debug } = require("../../terminal/debug");
const { error } = require("../../terminal/error");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("reset-account")
		.setDescription(
			"Use this command to delete your Cially Admin Account in order to create a new one.",
		),
	async execute(interaction) {
		debug({ text: `Admin Account reset request sent` });
		if (
			interaction.guild &&
			interaction.user.id === interaction.guild.ownerId
		) {
			console.log("This user is the server owner!");
		} else {
			console.log("This user is NOT the server owner.");
		}
		await interaction.reply("xxx");
	},
};
