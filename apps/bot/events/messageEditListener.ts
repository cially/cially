import { Events } from "discord.js";
import { debug } from "../terminal/debug";
import { error } from "../terminal/error";
import { sendPostRequest } from "../http/postRequest";
import { checkPrivacyPreferences } from "../http/API/functions/logic/checkPrivacyPreferences";

export const name = Events.Raw;
export const once = false;
export async function execute(packet: any) {
  if (packet.t !== "MESSAGE_UPDATE") return;

  // Check if author is opted out early to save resources
  const authorId = packet.d.author?.id;
  if (!authorId) return;

  const isUserOptedOut = await checkPrivacyPreferences(authorId);
  if (isUserOptedOut) {
    debug({ text: `User ${packet.d.author.username} (${authorId}) is opted out. Not processing message edit.` });
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
}
