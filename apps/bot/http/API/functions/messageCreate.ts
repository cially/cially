import { Request, Response } from "express";
import { debug } from "../../../terminal/debug";
import { error } from "../../../terminal/error";
import PocketBase from "pocketbase";
import { registerGuild } from "./logic/registerGuild";
import { retryRequest } from "./logic/retryRequest";

import { Client } from "discord.js";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);
const guild_collection_name = process.env.GUILD_COLLECTION;
const collection_name = process.env.MESSAGE_COLLECTION;

pb.autoCancellation(false);

export async function messageCreate(req: Request, res: Response, client?: Client): Promise<Response> {
  const body = req.body;
  const {
    guildID,
    messageID,
    messageLength,
    channelID,
    authorID,
    attachments,
  } = body;

  debug({ text: `New POST req: \n${JSON.stringify(body)}` });

  const roger = {
    res: `Message Received with the following details: GI: ${guildID}, MI: ${messageID}`,
  };

  try {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      await pb
        .collection("_superusers")
        .authWithPassword(adminEmail, adminPassword);
    }

    if (!guild_collection_name) throw new Error("GUILD_COLLECTION not configured.");
    if (!collection_name) throw new Error("MESSAGE_COLLECTION not configured.");

    const guild = await retryRequest(() =>
      pb
        .collection(guild_collection_name)
        .getFirstListItem(`discordID='${guildID}'`, {})
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
      author: authorID,
      guildID: guild.id,
      channelID,
      messageLength,
      messageID,
      messageCreation: currentPocketBaseDate(),
    };

    await retryRequest(() => pb.collection(collection_name).create(itemData));

    debug({
      text: `Message has been added in the database. ID: ${messageID}`,
    });

    const new_general_data = {
      total_messages: (guild.total_messages as number || 0) + 1,
      total_attachments: (guild.total_attachments as number || 0) + attachments,
    };

    await retryRequest(() =>
      pb.collection(guild_collection_name).update(guild.id, new_general_data)
    );

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

  debug({
    text: "End of logic. Stopping the communication and returning a res to the Bot",
  });

  return res.status(201).json(roger);
}
