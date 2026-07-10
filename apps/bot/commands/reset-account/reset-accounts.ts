import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { debug } from "../../terminal/debug";
import { error } from "../../terminal/error";
import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

export const data = new SlashCommandBuilder()
  .setName("reset-accounts")
  .setDescription(
    "Use this command to delete every Cially Admin Account in order to create a new one."
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (
    interaction.guild &&
    interaction.user.id === interaction.guild.ownerId
  ) {
    try {
      debug({ text: "Admin Account reset request sent" });

      const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
      const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

      if (adminEmail && adminPassword) {
        await pb
          .collection("_superusers")
          .authWithPassword(adminEmail, adminPassword);
      }

      const adminAccounts = await pb.collection("users").getFullList({
        filter: "admin = true",
      });

      for (const account of adminAccounts) {
        await pb.collection("users").delete(account.id);
        debug({
          text: `Deleted Admin Account with id ${account.id} successfully`,
        });
      }

      await interaction.reply({
        content: "All admin accounts got deleted successfully",
        flags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      error({
        text: "Something went wrong after trying to delete admin accounts",
      });

      console.log(err);
      await interaction.reply({
        content:
          "There was an error when trying to delete admin accounts. Please check your logs",
        flags: MessageFlags.Ephemeral,
      });
    }
  } else {
    await interaction.reply({
      content: "Only the Server Owner is allowed to use this command",
      flags: MessageFlags.Ephemeral,
    });
  }
}
