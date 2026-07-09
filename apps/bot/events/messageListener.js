"use strict";
const { Events } = require("discord.js");
const { debug } = require("../terminal/debug");
const { sendPostRequest } = require("../http/postRequest");
const { checkPrivacyPreferences } = require("../http/API/functions/logic/checkPrivacyPreferences");

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    // Check if author is opted out early to save resources
    const isUserOptedOut = await checkPrivacyPreferences(message.author.id);
    if (isUserOptedOut) {
      debug({ text: `User ${message.author.username} (${message.author.id}) is opted out. Not processing message.` });
      return;
    }

    if (!message.author.bot) {
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
        text: `New Message: \nAuthor: ${message.author.username}\nGuild: ${message.guild.name}, ${message.guild.id}\nMessage ID: ${message.id} \nMessage Length: ${totalWords.length} \nChannel: ${message.channel.name}, ${message.channelId}\nAttachments: ${totalMedia}`,
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
        type: module.exports.name,
      });
    }
  },
};
