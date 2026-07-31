"use server";

import PocketBase from "pocketbase";
import { checkAdminPermissions } from "@/components/checkAdminPermissions";

const url = process.env.POCKETBASE_URL;
const guild_collection_name = "guilds";

export async function scrapeMessagesAction(id: string) {
  await checkAdminPermissions();

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
      await fetch(`${process.env.API_URL}/serverScrape/${id}`);
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
