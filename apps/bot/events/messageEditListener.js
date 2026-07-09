"use strict";
const { Events } = require("discord.js");
const { debug } = require("../terminal/debug");
const { error } = require("../terminal/error");
const { sendPostRequest } = require("../http/postRequest");
const { checkPrivacyPreferences } = require("../http/API/functions/logic/checkPrivacyPreferences");

module.exports = {
  name: Events.Raw,
  once: false,
  async execute(packet) {
    if (packet.t !== "MESSAGE_UPDATE") return;

    // Check if author is opted out early to save resources
    const isUserOptedOut = await checkPrivacyPreferences(packet.d.author.id);
    if (isUserOptedOut) {
      debug({ text: `User ${packet.d.author.username} (${packet.d.author.id}) is opted out. Not processing message edit.` });
      return;
    }
    debug({ text: "Message Got Edited. Fetching Guild..." });

    try {
      const guildID = packet.d.guild_id;
      debug({ text: `Fetched Guild. Message Edit on Guild: ${guildID}` });

      const info = {
        guildID,
      };

      sendPostRequest({
        data: info,
        guildId: guildID,
        type: "messageEdit",
      });
    } catch (err) {
      error({
        text: `Failed to save Message Edit in the DB. Error: ${err}`,
      });
    }
  },
};
