const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { debug } = require("../../terminal/debug");
const { error } = require("../../terminal/error");

const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = process.env.GUILD_COLLECTION;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reset-account")
    .setDescription(
      "Use this command to delete your Cially Admin Account in order to create a new one.",
    ),
  async execute(interaction) {
    if (
      interaction.guild &&
      interaction.user.id === interaction.guild.ownerId
    ) {
      try {
        debug({ text: `Admin Account reset request sent` });

        await pb
          .collection("_superusers")
          .authWithPassword(
            process.env.POCKETBASE_ADMIN_EMAIL,
            process.env.POCKETBASE_ADMIN_PASSWORD,
          );
        const record = await pb
          .collection("users")
          .getFirstListItem("admin=true", {});

        await pb.collection("users").delete(record.id);
        debug({
          text: `Deleted Admin Account with id ${record.id} successfully`,
        });
        await interaction.reply({
          content: "Admin Account Deleted successfully",
          flags: MessageFlags.Ephemeral,
        });
      } catch (err) {
        error({
          text: `Something went wrong after trying to delete admin account`,
        });

        console.log(err);
        await interaction.reply({
          content:
            "There was an error when trying to delete admin account. Please check your logs",
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      await interaction.reply({
        content: "Only the Server Owner is allowed to use this command",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
