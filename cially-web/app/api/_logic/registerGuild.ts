// Imports
import PocketBase from "pocketbase";

// Initialize Pocketbase URL
const url = process.env.POCKETBASE_URL;

// Pocketbase Initialization
const pb = new PocketBase(url);
const guild_collection_name = process.env.GUILDS_COLLECTION;

export default async function registerGuild(guildID) {
	console.log("[DEBUG] Guild is not in the database. Attempting to add it...");
	const guildData = { discordID: guildID };
	try {
		const newGuild = await pb
			.collection(guild_collection_name)
			.create(guildData);
		console.log("[DEBUG] Guild has been added to the database");
		fetch(`${process.env.NEXT_PUBLIC_BOT_API_URL}/syncGuild/${guildID}`);
	} catch (error) {
		console.log(`\n[DEBUG] Failed to create new guild: \n${error}`);
	}
}
