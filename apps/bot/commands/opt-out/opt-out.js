const { SlashCommandBuilder, MessageFlags, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { debug } = require("../../terminal/debug");
const { error } = require("../../terminal/error");

const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("privacy-settings")
    .setDescription("Manage how Cially handles your data"),
  async execute(interaction, client) {
    debug({ text: `The privacy settings command got triggered by ${interaction.user.tag}` });

    const userID = interaction.user.id;
    let isUserOptedOut;

    const pb = new PocketBase(url);
    await pb.collection('_superusers').authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD);

    const optOutButton = new ButtonBuilder().setCustomId('opt-out').setLabel('Opt Out').setStyle(ButtonStyle.Danger);
    const optInButton = new ButtonBuilder().setCustomId('opt-in').setLabel('Opt In').setStyle(ButtonStyle.Success);
    const cancel = new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);
    let actionButton
    let userRecord

    try {

      userRecord = await pb.collection('opted_out').getFirstListItem(`user_id="${userID}"`);
      isUserOptedOut = "❌ Opted Out";
      actionButton = optInButton

    } catch (err) {

      if (err.status === 404) {
        isUserOptedOut = "✅ Opted In";
        actionButton = optOutButton
      } else {
        error({ text: `Failed to fetch user privacy status: \n${err}` });
      }

    }

    const embed = new EmbedBuilder()
      .setColor(0x2195cf)
      .setTitle('Privacy Settings')
      .setAuthor({ name: 'Cially', iconURL: interaction.client.user.avatarURL() })
      .setDescription("Cially tracks data such as when you send messages, message length etc. to help server owners optimize their community. Cially does not store sensitive information such as user message content. That data is visible only to the server owners and people that they've allowed access to.Feel free to contact server administrators to learn more about how your data is used.")
      .setThumbnail(interaction.client.user.avatarURL())
      .addFields({ name: 'Current Status', value: isUserOptedOut, inline: false });

    const cancelEmbed = new EmbedBuilder()
      .setColor(0x575757)
      .setTitle('Cancelled')
      .setAuthor({ name: 'Cially', iconURL: interaction.client.user.avatarURL() })
      .setDescription("You've cancelled the procedure")
      .setThumbnail(interaction.client.user.avatarURL())

    const optedOutEmbed = new EmbedBuilder()
      .setColor(0x940c27)
      .setTitle('Opted Out')
      .setAuthor({ name: 'Cially', iconURL: interaction.client.user.avatarURL() })
      .setDescription("You've Opted Out Succesfully. Every piece of data related to your account will be permanently removed from the database shortly. Cially won't track future data of yours and your account won't be visible in any analytics. However, anonymous data (such as the total number of messages sent) may still be visible as they're not linked to any specific user. You can opt back in at any time\n\n**Heads Up**\nMessage Deletions will continue to get tracked anonymized due to Discord's limitations")
      .setThumbnail(interaction.client.user.avatarURL())

    const optedInEmbed = new EmbedBuilder()
      .setColor(0x2a9e2f)
      .setTitle('Opted In')
      .setAuthor({ name: 'Cially', iconURL: interaction.client.user.avatarURL() })
      .setDescription("You've Opted In Succesfully. Cially now tracks your activity!")
      .setThumbnail(interaction.client.user.avatarURL())

    const incorrectEmbed = new EmbedBuilder()
      .setColor(0x575757)
      .setTitle('Cancelled')
      .setAuthor({ name: 'Cially', iconURL: interaction.client.user.avatarURL() })
      .setDescription("Confirmation text did not match. Action cancelled.")
      .setThumbnail(interaction.client.user.avatarURL());

    const modal = new ModalBuilder()
      .setCustomId('confirm-opt-out-modal')
      .setTitle('Confirm Opt Out');

    const confirmInput = new TextInputBuilder()
      .setCustomId('confirm-input')
      .setLabel('Type "CONFIRM" to permanently delete data')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('CONFIRM')
      .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(confirmInput);
    modal.addComponents(firstActionRow);

    const row = new ActionRowBuilder().addComponents(cancel, actionButton);

    const response = await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
      components: [row],
      withResponse: true
    })

    const collectorFilter = (i) => i.user.id === interaction.user.id;

    try {
      const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

      switch (confirmation.customId) {
        case ('opt-out'):
          await confirmation.showModal(modal);

          try {
            const modalSubmit = await confirmation.awaitModalSubmit({
              filter: (i) => i.customId === 'confirm-opt-out-modal' && i.user.id === interaction.user.id,
              time: 60_000
            });

            const userConfirmationText = modalSubmit.fields.getTextInputValue('confirm-input');
            if (userConfirmationText.toUpperCase() === 'CONFIRM') {
              await modalSubmit.update({ embeds: [optedOutEmbed], components: [] });
              await pb.collection('opted_out').create({
                user_id: userID
              });
              debug({ text: `User ${interaction.user.tag} has opted out` });
            } else {
              await modalSubmit.update({ embeds: [incorrectEmbed], components: [] });
            }
          } catch (modalErr) {
            try {
              await interaction.editReply({ embeds: [cancelEmbed], components: [] });
            } catch (e) {
              // ignore
            }
          }
          break;
        case ('opt-in'):
          await confirmation.update({ embeds: [optedInEmbed], components: [] });
          await pb.collection('opted_out').delete(userRecord.id);
          debug({ text: `User ${interaction.user.tag} has opted in` });
          break;
        case ('cancel'):
          await confirmation.update({ embeds: [cancelEmbed], components: [] });
          break;

      }

    } catch {
      await interaction.deleteReply();
    }

  },
};
