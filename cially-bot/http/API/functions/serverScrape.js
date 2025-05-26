const { discordScrape } = require("../functions/logic/scraping/discordScrape");
const { debug } = require("../../../terminal/debug");
const { error } = require("../../../terminal/error");

async function serverScrape(req, res, client) {
	try {
		const guildID = req.params.guildID;
		debug({
			text: `Scrape Request for Guild ${guildID} received. Scraping data...`,
		});
		data = await discordScrape({ client: client, guildID: guildID });

		return await res.status(201).json(data);
	} catch (err) {
		error({
			text: `Something went wrong after trying to scrape data of Guild: ${guildID}`,
		});
		console.log(err);
	}
}

module.exports = { serverScrape };
