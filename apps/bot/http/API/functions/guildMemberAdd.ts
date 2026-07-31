import { debug } from "../../../terminal/debug";
import { error } from "../../../terminal/error";
import { registerGuild } from "./logic/registerGuild";
import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const collection_name = process.env.MEMBER_JOINS_COLLECTION;
const guild_collection_name = process.env.GUILD_COLLECTION;

export async function guildMemberAdd(guildID: string, memberID: string) {

  debug({ text: `Message Received with the following details: GI: ${guildID}` });

  try {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      await pb
        .collection("_superusers")
        .authWithPassword(adminEmail, adminPassword);
    }

    if (!guild_collection_name) throw new Error("GUILD_COLLECTION not configured.");
    if (!collection_name) throw new Error("MEMBER_JOINS_COLLECTION not configured.");

    const guild = await pb
      .collection(guild_collection_name)
      .getFirstListItem(`discordID='${guildID}'`, {});

    debug({ text: "Guild has been found and is ready to add data to it" });

    const uniqueMemberSearch = await pb
      .collection(collection_name)
      .getList(1, 5, {
        filter: `memberID = "${memberID}"`,
      });

    const isUnique = uniqueMemberSearch.items.length === 0;

    try {
      const itemData = {
        guildID: guild.id,
        memberID: `${memberID}`,
        unique: isUnique,
      };
      await pb.collection(collection_name).create(itemData);
      debug({ text: "Member Addition has been added in the database." });
    } catch (err) {
      console.log(err);
    }
  } catch (err: any) {
    if (err.status === 404) {
      await registerGuild(guildID);
    } else {
      debug({ text: `Failed to communicate with the Database: \n${err}` });
      error({ text: `[ERROR] Error Code: ${err.status}` });
    }
  }
}
