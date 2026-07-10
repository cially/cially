import { Request, Response } from "express";
import { Client } from "discord.js";
import { discordScrape } from "../functions/logic/scraping/discordScrape";
import { debug } from "../../../terminal/debug";
import { error } from "../../../terminal/error";

export async function serverScrape(req: Request, res: Response, client: Client): Promise<Response | undefined> {
  try {
    const guildID = req.params.guildID as string;
    debug({
      text: `Scrape Request for Guild ${guildID} received. Scraping data...`,
    });
    const data = await discordScrape({ client, guildID });

    return res.status(201).json(data);
  } catch (err) {
    error({
      text: "Something went wrong after trying to scrape data of Guild",
    });
    console.log(err);
  }
}
