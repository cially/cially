"use server";

import PocketBase from "pocketbase";
import { checkAdminPermissions } from "@/components/checkAdminPermissions";

const url = process.env.POCKETBASE_URL;
const guild_collection_name = "guilds";

function isValidDiscordId(value: string): boolean {
  return /^[0-9]+$/.test(value);
}

export async function scrapeMessagesAction(id: string) {
  await checkAdminPermissions();

  if (!isValidDiscordId(id)) {
    return { error: 400 };
  }

  const pb = new PocketBase(url);
  try {
    await pb
      .collection("_superusers")
      .authWithPassword(
        String(process.env.POCKETBASE_ADMIN_EMAIL),
        String(process.env.POCKETBASE_ADMIN_PASSWORD)
      );

    const guild = await pb
      .collection(guild_collection_name)
      .getFirstListItem(`discordID='${id}'`, {});

    if (guild.beingScraped === false) {
      const safeId = encodeURIComponent(id);
      const scrapeUrl = new URL(`/serverScrape/${safeId}`, process.env.API_URL);
      await fetch(scrapeUrl.toString());
      const data = {
        beingScraped: true,
      };
      await pb.collection(guild_collection_name).update(guild.id, data);
      return "success";
    }
    return "On going scrape going on";
  } catch (err) {
    console.log(err);
    return { error: 404 };
  }
}
