import { Events } from "discord.js";
import { debug } from "../terminal/debug";
import { error } from "../terminal/error";
import { messageDelete } from "../http/API/functions/messageDelete";

export const name = Events.Raw;
export const once = false;
export async function execute(packet: any) {
  if (packet.t !== "MESSAGE_DELETE") return;

  try {
    const guildID = packet.d.guild_id;
    debug({ text: `Fetched Guild. Message Deleted on Guild: ${guildID}` });

    messageDelete(guildID)
  } catch (err) {
    error({
      text: `Failed to save Message Deletion in the DB. Error: ${err}`,
    });
  }
}
