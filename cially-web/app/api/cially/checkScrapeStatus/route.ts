import PocketBase from "pocketbase";

// Pocketbase Initialization
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = process.env.GUILDS_COLLECTION;

// Main GET Event
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const scrapedGuild = await pb
			.collection(guild_collection_name)
			.getFirstListItem('beingScraped=true', {
			});
		
		const guildName = scrapedGuild.name
		
		return Response.json({server: guildName});
	} catch (error) {
		if (error.status === 404) {
		return Response.json({ noServer: true });

		}
		console.log(error)
		return Response.json({ error: 404 });
	}
}
