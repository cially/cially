import { describe } from "node:test";
import PocketBase from "pocketbase";

// Pocketbase Initialization
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = process.env.GUILDS_COLLECTION;
const message_collection_name = process.env.MESSAGE_COLLECTION;

// Main GET Event
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	try {
		const API_REQ = await fetch(
			`${process.env.NEXT_PUBLIC_BOT_API_URL}/syncGuild/${id}`,
		);
		const data = await API_REQ.json();
		const code = data.code;
		const date = `${new Date().getUTCFullYear()}-${(new Date().getUTCMonth() + 1).toString().padStart(2, "0")}-${new Date().getUTCDate().toString().padStart(2, "0")}`;
		const previous_date = `${new Date().getUTCFullYear()}-${(new Date().getUTCMonth() + 1).toString().padStart(2, "0")}-${(new Date().getUTCDate() - 1).toString().padStart(2, "0")}`;

		if (code === "success") {
			try {
				const guild = await pb
					.collection(guild_collection_name)
					.getFirstListItem(`discordID='${id}'`, {});

				const today_msg_records = await pb
					.collection(message_collection_name)
					.getFullList({
						filter: `guildID ?= "${guild.id}" && created>'${date}'`,
						sort: "created",
					});

				const yesterday_msg_records = await pb
					.collection(message_collection_name)
					.getFullList({
						filter: `guildID ?= "${guild.id}" && created>'${previous_date}' && created<'${date}'`,
						sort: "created",
					});

				const msg_day_difference =
					today_msg_records.length - yesterday_msg_records.length;

				const guildFound = [
					{
						discordID: guild.discordID,
						name: guild.name,
						members: guild.members,
						available: guild.available,
						discord_partner: guild.discord_partner,
						creation_date: guild.creation_date,
						channels: guild.channels,
						roles: guild.roles,
						bans: guild.bans,
						owner_username: guild.owner_username,
						icon_url: guild.icon_url,
						description: guild.description,
						vanity_url: guild.vanity_url,
						vanity_uses: guild.vanity_uses,
						today_msg: today_msg_records.length,
						msg_day_difference: msg_day_difference,
					},
				];
				return Response.json({ guildFound });
			} catch (err) {
				if (err.status === 400) {
					const notFound = [{ errorCode: 404 }];
					return Response.json({ notFound });
				}
			}
		} else {
			const notFound = [{ errorCode: 404 }];
			return Response.json({ notFound });
		}
	} catch (err) {
		console.log(err);
		const notFound = [{ errorCode: 404 }];
		return Response.json({ notFound });
	}
}
