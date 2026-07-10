import { 
  ChatInputCommandInteraction, 
  SlashCommandBuilder, 
  MessageFlags, 
  EmbedBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ActionRowBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle,
  ModalSubmitInteraction,
  MessageComponentInteraction
} from "discord.js";
import { debug } from "../../terminal/debug";
import { error } from "../../terminal/error";
import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;

export const data = new SlashCommandBuilder()
  .setName("privacy-settings")
  .setDescription("Manage how Cially handles your data");

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.client.user) return;
  debug({ text: `The privacy settings command got triggered by ${interaction.user.tag}` });

  const userID = interaction.user.id;
  let isUserOptedOut: string;

  const pb = new PocketBase(url);
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);
  }

  const optOutButton = new ButtonBuilder().setCustomId('opt-out').setLabel('Opt Out').setStyle(ButtonStyle.Danger);
  const optInButton = new ButtonBuilder().setCustomId('opt-in').setLabel('Opt In').setStyle(ButtonStyle.Success);
  const cancel = new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);
  let actionButton: ButtonBuilder;
  let userRecord: any = null;

  try {
    userRecord = await pb.collection('opted_out').getFirstListItem(`user_id="${userID}"`);
    isUserOptedOut = "❌ Opted Out";
    actionButton = optInButton;
  } catch (err: any) {
    if (err.status === 404) {
      isUserOptedOut = "✅ Opted In";
      actionButton = optOutButton;
    } else {
      error({ text: `Failed to fetch user privacy status: \n${err}` });
      return;
    }
  }

  const avatarUrl = interaction.client.user.avatarURL() || undefined;

  const embed = new EmbedBuilder()
    .setColor(0x2195cf)
    .setTitle('Privacy Settings')
    .setAuthor({ name: 'Cially', iconURL: avatarUrl })
    .setDescription("Cially tracks data such as when you send messages, message length etc. to help server owners optimize their community. Cially does not store sensitive information such as user message content. That data is visible only to the server owners and people that they've allowed access to.Feel free to contact server administrators to learn more about how your data is used.")
    .setThumbnail(avatarUrl || null)
    .addFields({ name: 'Current Status', value: isUserOptedOut, inline: false });

  const cancelEmbed = new EmbedBuilder()
    .setColor(0x575757)
    .setTitle('Cancelled')
    .setAuthor({ name: 'Cially', iconURL: avatarUrl })
    .setDescription("You've cancelled the procedure")
    .setThumbnail(avatarUrl || null);

  const optedOutEmbed = new EmbedBuilder()
    .setColor(0x940c27)
    .setTitle('Opted Out')
    .setAuthor({ name: 'Cially', iconURL: avatarUrl })
    .setDescription("You've Opted Out Succesfully. Every piece of data related to your account will be permanently removed from the database shortly. Cially won't track future data of yours and your account won't be visible in any analytics. However, anonymous data (such as the total number of messages sent) may still be visible as they're not linked to any specific user. You can opt back in at any time\n\n**Heads Up**\nMessage Deletions will continue to get tracked anonymized due to Discord's limitations")
    .setThumbnail(avatarUrl || null);

  const optedInEmbed = new EmbedBuilder()
    .setColor(0x2a9e2f)
    .setTitle('Opted In')
    .setAuthor({ name: 'Cially', iconURL: avatarUrl })
    .setDescription("You've Opted In Succesfully. Cially now tracks your activity!")
    .setThumbnail(avatarUrl || null);

  const incorrectEmbed = new EmbedBuilder()
    .setColor(0x575757)
    .setTitle('Cancelled')
    .setAuthor({ name: 'Cially', iconURL: avatarUrl })
    .setDescription("Confirmation text did not match. Action cancelled.")
    .setThumbnail(avatarUrl || null);

  const modal = new ModalBuilder()
    .setCustomId('confirm-opt-out-modal')
    .setTitle('Confirm Opt Out');

  const confirmInput = new TextInputBuilder()
    .setCustomId('confirm-input')
    .setLabel('Type "CONFIRM" to permanently delete data')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('CONFIRM')
    .setRequired(true);

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(confirmInput);
  modal.addComponents(firstActionRow);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, actionButton);

  const response = await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
    components: [row],
    withResponse: true
  });

  const collectorFilter = (i: any) => i.user.id === interaction.user.id;

  try {
    const confirmation = await (response as any).resource.message.awaitMessageComponent({ filter: collectorFilter, time: 60_000 }) as MessageComponentInteraction;

    switch (confirmation.customId) {
      case ('opt-out'):
        await confirmation.showModal(modal);

        try {
          const modalSubmit = await confirmation.awaitModalSubmit({
            filter: (i: any) => i.customId === 'confirm-opt-out-modal' && i.user.id === interaction.user.id,
            time: 60_000
          }) as any;

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
        if (userRecord && userRecord.id) {
          await pb.collection('opted_out').delete(userRecord.id);
        }
        debug({ text: `User ${interaction.user.tag} has opted in` });
        break;
      case ('cancel'):
        await confirmation.update({ embeds: [cancelEmbed], components: [] });
        break;
    }
  } catch {
    await interaction.deleteReply();
  }
}
