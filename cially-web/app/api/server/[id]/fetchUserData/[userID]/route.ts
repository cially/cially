import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = "guilds";
const MEMBER_JOINS_COLLECTION = "member_joins";
const MEMBER_LEAVES_COLLECTION = "member_leaves";
const INVITE_COLLECTION = "invites";
const user_stats_collection = "user_stats";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string; userID: string }> },
) {
	const { id, userID } = await params;

	try {
		const guild = await pb
			.collection(guild_collection_name)
			.getFirstListItem(`discordID='${id}'`, {});

		const member_joins = await pb
			.collection(MEMBER_JOINS_COLLECTION)
			.getFullList({
				filter: `memberID ?= "${userID}" && guildID?="${guild.id}"`,
			});

		const member_leaves = await pb
			.collection(MEMBER_LEAVES_COLLECTION)
			.getFullList({
				filter: `memberID ?= "${userID}" && guildID?="${guild.id}"`,
			});

		const member_invites = await pb.collection(INVITE_COLLECTION).getFullList({
			filter: `authorID ?= "${userID}" && guildID?="${guild.id}"`,
		});

		const userStats = await pb
			.collection(user_stats_collection)
			.getFirstListItem(`authorID='${userID}' && guildID?="${guild.id}"`, {});

		const totalMessages = userStats.totalMessages || 0;
		const totalMessageLength = userStats.totalMessageLength || 0;
		const avgMessageLength =
			totalMessages > 0 ? Math.round(totalMessageLength / totalMessages) : 0;

		const dataArray = [];

		const discordDataOUT = [{ userID: userID }];

		const discordDataIN_Req = await fetch(
			`${process.env.NEXT_PUBLIC_BOT_API_URL}/fetchUserData/${id}`,
			{
				body: JSON.stringify(discordDataOUT),
				headers: {
					"Content-Type": "application/json",
				},
				method: "POST",
			},
		);
		const discordDataIN = await discordDataIN_Req.json();
		const username = discordDataIN[0].username;
		const globalName = discordDataIN[0].globalName;
		const avatar = discordDataIN[0].avatar;
		const creationDate = discordDataIN[0].creationDate;

		dataArray.push({
			totalJoins: member_joins.length,
			totalLeaves: member_leaves.length,
			totalInvites: member_invites.length,
			totalMessages: totalMessages,
			averageMessageLength: avgMessageLength,
		});

		return Response.json({
			userID,
			username,
			globalName,
			avatar,
			creationDate,
			dataArray,
		});
	} catch (_err) {
		return Response.json({
			error: 404,
		});
	}
}
