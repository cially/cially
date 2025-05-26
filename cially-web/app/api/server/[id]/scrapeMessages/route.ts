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
	const { id } = await params;
	try {
		const guild = await pb
		.collection(guild_collection_name)
		.getFirstListItem(`discordID='${id}'`, {});
		
		console.log(id)
		console.log(guild.beingScraped);

		if (guild.beingScraped === false) {
			await fetch(`${process.env.NEXT_PUBLIC_BOT_API_URL}/serverScrape/${id}`);
			const data = {
				beingScraped: true,
			};
			await pb.collection(guild_collection_name).update(guild.id, data);
			return Response.json("success");
		} else {
			return Response.json("On going scrape going on");
		}
	} catch (err) {
		console.log(err);
		return Response.json({
			error: 404,
		});
	}
}
