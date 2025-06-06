import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const guild_collection_name: string = process.env.GUILDS_COLLECTION || "guilds";
const pb = new PocketBase(url);

export async function GET() {
	try {
		const scrapedGuild = await pb
			.collection(guild_collection_name)
			.getFirstListItem("beingScraped=true", {});

		const guildName = scrapedGuild.name;

		return Response.json({ server: guildName });
	} catch (error) {
		if (error.status === 404) {
			return Response.json({ noServer: true });
		}
		console.log(error);
		return Response.json({ error: 404 });
	}
}
