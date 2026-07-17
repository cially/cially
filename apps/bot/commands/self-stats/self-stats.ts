import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { debug } from "../../terminal/debug";
import { error } from "../../terminal/error";
import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;

export const data = new SlashCommandBuilder()
	.setName("self-stats")
	.setDescription(
		"Shows you your personal stats."
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	if (
		interaction.guild
	) {
		try {
			const pb = new PocketBase(url);
			const userID = interaction.user.id;

			debug({ text: "Self Stats command sent" });

			const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
			const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

			if (adminEmail && adminPassword) {
				await pb
					.collection("_superusers")
					.authWithPassword(adminEmail, adminPassword);
			}

			const guildRecord = await pb.collection('guilds').getFirstListItem(
				`discordID = "${interaction.guild.id}"`
			);

			const userRecord = await pb.collection('user_stats').getFirstListItem(
				`authorID="${userID}" && guildID="${guildRecord.id}"`
			);

			const totalMessages = userRecord.totalMessages;
			const totalMessageLength = userRecord.totalMessageLength;
			const vcTime = userRecord.vc_time;

			const avatarUrl = interaction.client.user.avatarURL() || undefined;


			const embed = new EmbedBuilder()
				.setColor(0x2195cf)
				.setAuthor({
					name: `Cially`,
					iconURL: avatarUrl
				})
				.setTitle(`${interaction.user.username}'s Stats`)
				.setDescription(`Here are your stats for **${interaction.guild.name}**`)
				.setThumbnail(avatarUrl || null)
				.addFields({ name: '', value: "", inline: false })
				.addFields({ name: 'Total Messages Sent', value: String(totalMessages), inline: false })
				.addFields({ name: 'Average Message Length', value: String(totalMessageLength / totalMessages), inline: false })
				.addFields({ name: 'Voice Chat Time', value: `${String(Math.round(vcTime / 60))} minutes`, inline: false })
				.setFooter({ text: 'Powered by Cially Dashboard' })
				.setTimestamp();

			await interaction.reply({
				embeds: [embed]
			});



		} catch (err) {
			error({
				text: "Something went wrong when fetching the user's stats",
			});
			console.log(err)
		}
	}
}
