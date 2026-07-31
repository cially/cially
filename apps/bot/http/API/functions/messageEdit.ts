import { debug } from "../../../terminal/debug";
import { error } from "../../../terminal/error";
import { registerGuild } from "./logic/registerGuild";
import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);
const guild_collection_name = process.env.GUILD_COLLECTION;

export async function messageEdit(guildID: string) {

  debug({ text: `Message Edit Received with the following details: GI: ${guildID}` });

  try {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      await pb
        .collection("_superusers")
        .authWithPassword(adminEmail, adminPassword);
    }

    if (!guild_collection_name) throw new Error("GUILD_COLLECTION not configured.");

    const guild = await pb
      .collection(guild_collection_name)
      .getFirstListItem(`discordID='${guildID}'`, {});
    debug({ text: "Guild has been found and is ready to add data to it" });

    const new_general_data = {
      message_edits: (guild.message_edits as number || 0) + 1,
    };

    await pb
      .collection(guild_collection_name)
      .update(guild.id, new_general_data);
    debug({
      text: "General Guild Data has been updated in the database",
    });
  } catch (err: any) {
    if (err.status === 404) {
      registerGuild(guildID);
    } else {
      debug({ text: `Failed to communicate with the Database: \n${err}` });
      error({ text: `[ERROR] Error Code: ${err.status}` });
    }
  }
}
