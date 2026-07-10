import { Request, Response } from "express";
import { Client } from "discord.js";
import { debug } from "../../../terminal/debug";

export async function fetchUserData(req: Request, res: Response, client: Client): Promise<void> {
  const error_message = { code: "error" };
  const body = req.body;
  const guildID = req.params.guildID;
  const userId = body[0].userID;
  const channelID = body[0].channelID;

  const dataArray: any[] = [];

  debug({
    text: `User Data Fetching Request Received for Guild ID: ${guildID}`,
  });

  try {
    const user = await client.users.fetch(userId);

    dataArray.push({
      username: user.username,
      globalName: user.globalName,
      avatar: user.displayAvatarURL(),
      creationDate: user.createdAt,
    });

    try {
      const discordChannel = await client.channels.fetch(channelID);
      const name = discordChannel && 'name' in discordChannel ? (discordChannel as any).name : channelID;

      dataArray.push({ channel: { id: channelID, name } });

      debug({ text: "User Data fetched. Ready to send response" });

      res.send(dataArray);
    } catch (_err) {
      debug({ text: "Failed to fetch Channel Name" });
      dataArray.push({ channel: { id: channelID, name: channelID } });
      res.send(dataArray);
    }
  } catch (_err) {
    debug({ text: "Failed to fetch User Data" });
    res.send(error_message);
  }
}
