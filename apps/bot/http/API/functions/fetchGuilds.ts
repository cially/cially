import { Request, Response } from "express";
import { Client } from "discord.js";
import { debug } from "../../../terminal/debug";
import { error } from "../../../terminal/error";
import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);
const guild_collection_name = process.env.GUILD_COLLECTION;

export async function fetchGuilds(_req: Request, res: Response, client: Client): Promise<void> {
  const error_message = { code: "error" };
  debug({ text: "Server Fetching Request Received" });

  try {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      await pb
        .collection("_superusers")
        .authWithPassword(adminEmail, adminPassword);
    }
    const guilds_in_database: string[] = [];
    if (!guild_collection_name) throw new Error("GUILD_COLLECTION not configured.");
    
    const guilds = await pb.collection(guild_collection_name).getFullList({});
    guilds.forEach((guild) => {
      guilds_in_database.push(guild.discordID);
    });

    try {
      const discord_guilds = client.guilds.cache;
      const guildsArray: any[] = [];
      const guildsList = Array.from(discord_guilds.values());
      
      await Promise.all(
        guildsList.map(async (guild) => {
          const icon = guild.iconURL();
          if (guilds_in_database.includes(guild.id)) {
            guildsArray.push({
              name: guild.name,
              id: guild.id,
              icon,
              in_db: true,
            });
          } else {
            guildsArray.push({
              name: guild.name,
              id: guild.id,
              icon,
              in_db: false,
            });
          }
        })
      );

      debug({ text: "Completed Fetching Available Guilds" });
      res.send({ AvailableGuilds: guildsArray, responseCode: 200 });
    } catch (err) {
      error({
        text: "Failed to communicate with the Discord API. /fetchGuilds",
      });
      console.log(err);
      res.send({ responseCode: 500, errorMessage: error_message });
    }
  } catch (err) {
    error({
      text: "Failed to communicate with the PocketBase Instance. /fetchGuilds",
    });
    console.log(err);
    res.send({ responseCode: 502, errorMessage: error_message });
  }
}
