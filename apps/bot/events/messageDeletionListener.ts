import { Events } from "discord.js";
import { debug } from "../terminal/debug";
import { error } from "../terminal/error";
import { sendPostRequest } from "../http/postRequest";

export const name = Events.Raw;
export const once = false;
export async function execute(packet: any) {
  if (packet.t !== "MESSAGE_DELETE") return;

  try {
    const guildID = packet.d.guild_id;
    debug({ text: `Fetched Guild. Message Deleted on Guild: ${guildID}` });

    const info = {
      guildID,
    };

    sendPostRequest({
      data: info,
      guildId: guildID,
      type: "messageDelete",
    });
  } catch (err) {
    error({
      text: `Failed to save Message Deletion in the DB. Error: ${err}`,
    });
  }
}
