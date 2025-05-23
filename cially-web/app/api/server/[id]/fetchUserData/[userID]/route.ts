import PocketBase from "pocketbase";

// Pocketbase Initialization
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = process.env.GUILDS_COLLECTION;
const message_collection_name = process.env.MESSAGE_COLLECTION;
const MEMBER_JOINS_COLLECTION = process.env.MEMBER_JOINS_COLLECTION;
const MEMBER_LEAVES_COLLECTION = process.env.MEMBER_LEAVES_COLLECTION;
const INVITE_COLLECTION = process.env.INVITE_COLLECTION;

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

		const member_messages = await pb
			.collection(message_collection_name)
			.getFullList({
				filter: `author ?= "${userID}" && guildID?="${guild.id}"`,
			});

		const dataArray = [];
		let avgMessageLength = 0;

		for (const item of member_messages) {
			avgMessageLength = avgMessageLength + item.messageLength;
		}

		avgMessageLength = Math.round(avgMessageLength / member_messages.length);

		let activeChannels = [];

		for (const message of member_messages) {
			const channel = message.channelID;
			const position = activeChannels.findIndex(
				(item) => item.channel === channel,
			);
			if (position !== -1) {
				activeChannels[position].amount = activeChannels[position].amount + 1;
			} else {
				activeChannels.push({ channel: channel, amount: 1 });
			}
		}

		activeChannels.sort((a, b) => b.amount - a.amount);
		activeChannels = activeChannels.slice(0, 1);

		const discordDataOUT = [
			{
				userID: userID,
				channelID: activeChannels[0].channel,
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

		activeChannels.push({
			channel: discordDataIN[1].channel.name,
			amount: activeChannels[0].amount,
		});
		activeChannels = activeChannels.slice(1, 2);

		dataArray.push({
			totalJoins: member_joins.length,
			totalLeaves: member_leaves.length,
			totalInvites: member_invites.length,
			totalMessages: member_messages.length,
			averageMessageLength: avgMessageLength,
			activeChannel: activeChannels,
		});

		return Response.json({
			userID,
			username,
			globalName,
			avatar,
			creationDate,
			dataArray,
		});
	} catch (err) {
		return Response.json({
			error: 404,
		});
	}
}
