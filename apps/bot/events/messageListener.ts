import { Events, Message } from "discord.js";
import { debug } from "../terminal/debug";
import { sendPostRequest } from "../http/postRequest";
import { checkPrivacyPreferences } from "../http/API/functions/logic/checkPrivacyPreferences";

export const name = Events.MessageCreate;
export const once = false;
export async function execute(message: Message) {
  // Check if author is opted out early to save resources
  const isUserOptedOut = await checkPrivacyPreferences(message.author.id);
  if (isUserOptedOut) {
    debug({ text: `User ${message.author.username} (${message.author.id}) is opted out. Not processing message.` });
    return;
  }

  if (!message.author.bot && message.guild) {
    // Get the number of words per message
    const totalWords = message.content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    // Get the number of images/videos
    const mediaAttachments = message.attachments.filter((attachment) => {
      const type = attachment.contentType || "";
      return type.startsWith("image/") || type.startsWith("video/");
    });
    const totalMedia = mediaAttachments.size;

    debug({
      text: `New Message: \nAuthor: ${message.author.username}\nGuild: ${message.guild.name}, ${message.guild.id}\nMessage ID: ${message.id} \nMessage Length: ${totalWords.length} \nChannel: ${(message.channel as any).name}, ${message.channelId}\nAttachments: ${totalMedia}`,
    });

    const info = {
      guildID: message.guild.id,
      messageID: message.id,
      messageLength: totalWords.length,
      channelID: message.channelId,
      authorID: message.author.id,
      attachments: totalMedia,
    };
    sendPostRequest({
      data: info,
      guildId: message.guild.id,
      type: Events.MessageCreate,
    });
  }
}
