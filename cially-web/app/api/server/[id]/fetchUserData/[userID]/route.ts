import PocketBase from "pocketbase";

// Pocketbase Initialization
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = process.env.GUILDS_COLLECTION;
const MEMBER_JOINS_COLLECTION = process.env.MEMBER_JOINS_COLLECTION;
const MEMBER_LEAVES_COLLECTION = process.env.MEMBER_LEAVES_COLLECTION;
const INVITE_COLLECTION = process.env.INVITE_COLLECTION;
// Updated collection names for new schema
const user_stats_collection = "user_stats";
const channel_stats_collection = "channel_stats";

// Main GET Event
export async function GET(
	request: Request,
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

		// Fetch user stats directly from user_stats collection
		const userStats = await pb
			.collection(user_stats_collection)
			.getFirstListItem(`authorID='${userID}' && guildID?="${guild.id}"`, {});

		const totalMessages = userStats.totalMessages || 0;
		const totalMessageLength = userStats.totalMessageLength || 0;
		const avgMessageLength =
			totalMessages > 0 ? Math.round(totalMessageLength / totalMessages) : 0;

		// Find user's most active channel by getting all channel stats and checking which has most messages from this user
		// Since channel_stats doesn't track per-user data, we need to find the most active channel overall
		// This is a limitation of the new schema - we lose per-user channel activity
		const channelStats = await pb
			.collection(channel_stats_collection)
			.getFullList({
				filter: `guildID ?= "${guild.id}"`,
				sort: "-amount",
			});

		// Take the most active channel as fallback (since we can't get user-specific channel activity)
		const mostActiveChannel = channelStats.length > 0 ? channelStats[0] : null;

		const dataArray = [];

		let activeChannels = [];

		if (mostActiveChannel) {
			const discordDataOUT = [
				{
					userID: userID,
					channelID: mostActiveChannel.channelID,
				},
			];

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
		} else {
			// Fallback when no channel data available
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
				activeChannel: [],
			});

			return Response.json({
				userID,
				username,
				globalName,
				avatar,
				creationDate,
				dataArray,
			});
		}
	} catch (err) {
		return Response.json({
			error: 404,
		});
	}
}
