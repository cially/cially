import { Request, Response } from "express";
import { Client } from "discord.js";
import { debug } from "../../../terminal/debug";
import { error } from "../../../terminal/error";
import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);
const guild_collection_name = process.env.GUILD_COLLECTION;

export async function syncGuild(req: Request, res: Response, client: Client): Promise<void> {
  const success_message = { responseCode: 200 };
  const error_message = { responseCode: 500 };

  const guildID = req.params.guildID;

  debug({ text: `Syncronization Request Received for Guild ID: ${guildID}` });

  async function fetchGuilds() {
    try {
      const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
      const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

      if (adminEmail && adminPassword) {
        await pb
          .collection("_superusers")
          .authWithPassword(adminEmail, adminPassword);
      }

      if (!guild_collection_name) throw new Error("GUILD_COLLECTION not configured.");

      const guilds = await pb.collection(guild_collection_name).getFullList({
        filter: `discordID ?= '${guildID}'`,
      });

      if (guilds.length > 0) {
        guilds.forEach((guild) => {
          async function syncDataToPocketbase() {
            const Guild = client.guilds.cache.get(`${String(guild.discordID)}`);
            if (!Guild) {
              error({ text: `Bot is not in Guild ID: ${guild.discordID}` });
              return;
            }
            const channels = Guild.channels.cache.size;
            const roles = Guild.roles.cache.size;
            const bans = Guild.bans.cache.size;
            const owner = await Guild.fetchOwner();
            const icon_url = Guild.iconURL();
            const vanity_url = Guild.vanityURLCode;

            try {
              await Guild.members.fetch();
            } catch (err: any) {
              error({
                text: `Failed to fetch members for Guild ${Guild.name} (ID: ${Guild.id}): ${err.message}`,
              });
            }
            const statusCount: Record<string, number> = {
              online: 0,
              idle: 0,
              dnd: 0,
              offline: 0,
            };

            Guild.members.cache.forEach((member) => {
              const status = member.presence?.status || "offline";
              if (statusCount[status] !== undefined) {
                statusCount[status]++;
              }
            });

            async function fetchVanityData() {
              return Guild!.fetchVanityData()
                .then((res) => {
                  return res.uses;
                })
                .catch(() => {
                  return -1;
                });
            }
            const vanity_uses = await fetchVanityData();

            debug({ text: `Syncing Guild: ${Guild.name}, ${Guild.id}` });
            const newData = {
              name: Guild.name,
              members: Guild.memberCount,
              available: Guild.available,
              discord_partner: Guild.partnered,
              channels,
              roles,
              bans,
              creation_date: Guild.createdAt,
              owner_username: owner.user.username,
              icon_url,
              description: Guild.description,
              vanity_url,
              vanity_uses,
              online: statusCount.online + statusCount.dnd,
              offline: statusCount.offline,
              idle: statusCount.idle,
            };
            try {
              await pb.collection("guilds").update(`${guild.id}`, newData);
              debug({
                text: `Guild got synced: ${Guild.name}, ${Guild.id}`,
              });
            } catch (err) {
              error({ text: `Failed to push new data: \n${err}` });
            }
          }

          if (guild.discordID) {
            try {
              syncDataToPocketbase();
              res.send(success_message);
            } catch (err) {
              error({
                text: `Failed to sync data for GuildID: ${guild.discordID}\n${err}`,
              });
              res.send(error_message);
            }
          }
        });
      } else {
        debug({
          text: `Failed to fetch guild with ID: ${guildID}`,
        });
        res.send(error_message);
      }
    } catch (err) {
      error({ text: `Failed to fetch guild: \n${err}` });
    }
  }

  try {
    fetchGuilds();
  } catch (err) {
    console.log(err);
    error({ text: "Failed to communicate with the Database" });
    res.send(error_message);
  }
}
