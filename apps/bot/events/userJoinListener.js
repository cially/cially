"use strict";
const { Events } = require("discord.js");
const { debug } = require("../terminal/debug");
const { sendPostRequest } = require("../http/postRequest");
const { checkPrivacyPreferences } = require("../http/API/functions/logic/checkPrivacyPreferences");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    // Check if author is opted out early to save resources
    const isUserOptedOut = await checkPrivacyPreferences(member.id);
    if (isUserOptedOut) {
      debug({ text: `User ${member.user.username} (${member.user.id}) is opted out. Not processing join event.` });
      return;
    }

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
