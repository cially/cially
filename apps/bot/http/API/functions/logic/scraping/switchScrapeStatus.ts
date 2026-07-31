import { debug } from "../../../../../terminal/debug";
import { error } from "../../../../../terminal/error";
import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = process.env.GUILD_COLLECTION;

export async function switchScrapeStatus(guildID: string): Promise<void> {
  try {
    if (!guild_collection_name) throw new Error("GUILD_COLLECTION not configured.");
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      await pb
        .collection("_superusers")
        .authWithPassword(adminEmail, adminPassword);
    }

    const guild = await pb
      .collection(guild_collection_name)
      .getFirstListItem(`discordID?="${guildID}"`, {});

    const data = {
      beingScraped: false,
    };
    await pb.collection(guild_collection_name).update(guild.id, data);
    debug({ text: `Set scrapeStatus to false for Guild: ${guildID}` });
  } catch (err) {
    error({
      text: `Failed to set scrapeStatus to false for Guild: ${guildID}`,
    });
    console.log(err);
  }
}

export async function enableScrapeStatus(guildID: string): Promise<void> {
  try {
    if (!guild_collection_name) throw new Error("GUILD_COLLECTION not configured.");
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      await pb
        .collection("_superusers")
        .authWithPassword(adminEmail, adminPassword);
    }
    const guild = await pb
      .collection(guild_collection_name)
      .getFirstListItem(`discordID?="${guildID}"`, {});

    const data = {
      beingScraped: true,
    };
    await pb.collection(guild_collection_name).update(guild.id, data);
    debug({ text: `Set scrapeStatus to true for Guild: ${guildID}` });
  } catch (err) {
    error({
      text: `Failed to set scrapeStatus to true for Guild: ${guildID}`,
    });
    console.log(err);
  }
}

export async function setAllScrapeStatusesFalse(): Promise<void> {
  try {
    if (!guild_collection_name) throw new Error("GUILD_COLLECTION not configured.");
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      await pb
        .collection("_superusers")
        .authWithPassword(adminEmail, adminPassword);
    }
    const result = await pb.collection(guild_collection_name).getFullList({
      filter: "beingScraped != false",
    });

    if (result.length === 0) {
      debug({ text: "All guilds are already marked as beingScraped: false" });
      return;
    }

    for (const guild of result) {
      try {
        await pb.collection(guild_collection_name).update(guild.id, {
          beingScraped: false,
        });
        debug({
          text: `Set beingScraped to false for Guild: ${guild.discordID}`,
        });
      } catch (updateError) {
        error({ text: `Failed to update Guild: ${guild.discordID}` });
        console.log(updateError);
      }
    }
  } catch (err) {
    error({ text: "Failed to fetch guilds from PocketBase" });
    console.log(err);
  }
}
