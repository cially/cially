const { debug } = require("../../../terminal/debug");
const { error } = require("../../../terminal/error");
const { discordScrape } = require("../functions/logic/scraping/discordScrape");
const {
  pbCollectionAutoDelete,
} = require("../functions/logic/scraping/pbCollectionAutoDelete");
const { pbAddNewData } = require("../functions/logic/scraping/pbAddNewData");

async function serverScrape(req, res, client) {
  const guildID = "1363130785636548880";
  console.log("Scrape request received");
  let data = "rabababa";

  pbCollectionAutoDelete(guildID);

  data = await discordScrape({ client: client, guildID: guildID });

  await pbCollectionAutoDelete(guildID);

  await pbAddNewData({ guildID: guildID, data: data.messages });

  return await res.status(201).json(data);
}

module.exports = { serverScrape };
