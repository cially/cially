import { debug } from "../../../terminal/debug";
import { error } from "../../../terminal/error";
import PocketBase from "pocketbase";
import { registerGuild } from "./logic/registerGuild";
import { retryRequest } from "./logic/retryRequest";

const url = process.env.POCKETBASE_URL;
const guild_collection_name = process.env.GUILD_COLLECTION;
const collection_name = process.env.VC_QUEUE_COLLECTION;

export async function vcStateUpdate(
  guildID: string,
  userID: string,
  channelID: string,
  action: "join" | "leave"
) {
  const pb = new PocketBase(url);
  pb.autoCancellation(false);

  debug({
    text: `VC Join Received with the following details: GI: ${guildID}, CI: ${channelID}, UI: ${userID}, action: ${action}`,
  });

  try {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      await pb
        .collection("_superusers")
        .authWithPassword(adminEmail, adminPassword);
    }

    if (!guild_collection_name)
      throw new Error("GUILD_COLLECTION not configured.");
    if (!collection_name)
      throw new Error("VC_QUEUE_COLLECTION not configured.");

    const guild = await retryRequest(() =>
      pb
        .collection(guild_collection_name)
        .getFirstListItem(`discordID='${guildID}'`, {}),
    );

    debug({ text: "Guild has been found and is ready to add data to it" });

    const currentPocketBaseDate = () => {
      const date = new Date();
      const pad = (num: number, size = 2) => String(num).padStart(size, "0");

      const year = date.getUTCFullYear();
      const month = pad(date.getUTCMonth() + 1);
      const day = pad(date.getUTCDate());
      const hours = pad(date.getUTCHours());
      const minutes = pad(date.getUTCMinutes());
      const seconds = pad(date.getUTCSeconds());
      const milliseconds = pad(date.getUTCMilliseconds(), 3);

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}Z`;
    };

    const itemData = {
      user_id: userID,
      guild: guild.id,
      channel_id: channelID,
      action: action,
      event_creation: currentPocketBaseDate(),
    };

    const newRecord = await retryRequest(() => pb.collection(collection_name).create(itemData));

    debug({
      text: `VC Event has been added in the database. PB ID: ${newRecord.id}`,
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
