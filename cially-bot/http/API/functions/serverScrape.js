const { discordScrape } = require("../functions/logic/scraping/discordScrape");

async function serverScrape(req, res, client) {
	const guildID = "640292981571584013";
	console.log("Scrape request received");
	let data = "rabababa";

	data = await discordScrape({ client: client, guildID: guildID });

	return await res.status(201).json(data);
}

module.exports = { serverScrape };
