"use strict";
const { Events } = require("discord.js");
const { debug } = require("../terminal/debug");
const { sendPostRequest } = require("../http/postRequest");
const { checkPrivacyPreferences } = require("../http/API/functions/logic/checkPrivacyPreferences");

module.exports = {
  name: Events.InviteCreate,
  async execute(invite) {

    // Check if author is opted out early to save resources
    const isUserOptedOut = await checkPrivacyPreferences(invite.inviter.id);
    if (isUserOptedOut) {
      debug({ text: `User ${invite.inviter.name} (${invite.inviter.id}) is opted out. Not processing invite event.` });
      return;
    }

    debug({
      text: `New Invite Created: \nGuild: ${invite.guild.name}, ${invite.guild}\nChannel: ${invite.channel.name}, ${invite.channelId}\nInviter: ${invite.inviterId}\n`,
    });

    const info = {
      guildID: invite.guild.id,
      channelID: invite.channelId,
      authorID: invite.inviterId,
    };
    sendPostRequest({
      data: info,
      guildId: invite.guild.id,
      type: module.exports.name,
    });
  },
};
