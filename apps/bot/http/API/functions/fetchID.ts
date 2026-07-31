import { Request, Response } from "express";
import { Client } from "discord.js";
import { debug } from "../../../terminal/debug";
import { error } from "../../../terminal/error";

export async function fetchID(req: Request, res: Response, client: Client): Promise<void> {
  const error_message = { code: "error" };
  const body = req.body;
  const guildID = req.params.guildID;

  debug({ text: `ID Fetching Request Received for Guild ID: ${guildID}` });

  try {
    const channels = body[0].channels as string[];
    const users = body[0].users as string[];
    const newArray: { newChannels: any[]; newUsers: any[] } = { newChannels: [], newUsers: [] };

    await Promise.all([
      ...channels.map(async (channel) => {
        try {
          const discordChannel = await client.channels.fetch(channel);
          if (discordChannel && 'name' in discordChannel) {
            newArray.newChannels.push({
              id: channel,
              name: `${(discordChannel as any).name}`,
            });
            debug({ text: `Added Succesfully Channel: ${channel}` });
          }
        } catch (_err) {
          debug({ text: `Failed to add Channel: ${channel}` });
        }
      }),
      ...users.map(async (user) => {
        try {
          const discordUser = client.users.cache.get(user);
          if (discordUser) {
            newArray.newUsers.push({ id: user, name: discordUser.username });
            debug({ text: `Added Succesfully User: ${user}` });
          }
        } catch (_err) {
          debug({ text: `Failed to add User: ${user}` });
        }
      })
    ]);

    debug({ text: "IDs fetched. Ready to send response" });
    res.send(newArray);
  } catch (err) {
    error({
      text: `Failed to communicate with the Discord API. /fetchID${guildID}`,
    });
    console.log(err);
    res.send(error_message);
  }
}
