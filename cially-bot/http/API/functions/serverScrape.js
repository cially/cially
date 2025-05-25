const { debug } = require("../../../terminal/debug");
const { error } = require("../../../terminal/error");
const { discordScrape } = require("../functions/logic/scraping/discordScrape");
const {
  pbCollectionAutoDelete,
} = require("../functions/logic/scraping/pbCollectionAutoDelete");
const { pbAddNewData } = require("../functions/logic/scraping/pbAddNewData");

async function serverScrape(req, res, client) {
  const guildID = "640292981571584013";
  console.log("Scrape request received");
  let data = "rabababa";


  data = await discordScrape({ client: client, guildID: guildID });

  // await pbAddNewData({ guildID: guildID, data: data.messages });

  return await res.status(201).json(data);
}

module.exports = { serverScrape };
