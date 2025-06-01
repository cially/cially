import PocketBase from "pocketbase";

// Pocketbase Initialization
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = process.env.GUILDS_COLLECTION;
// Updated collection names for new schema
const channel_stats_collection = "channel_stats";
const user_stats_collection = "user_stats";
const hourly_stats_collection = "hourly_stats";

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

		try {
			// Fetch channel stats directly from channel_stats collection
			const channelStats = await pb
				.collection(channel_stats_collection)
				.getFullList({
					filter: `guildID ?= "${guild.id}"`,
					sort: "-amount",
				});

			// Take top 5 channels
			const activeChannels = channelStats.slice(0, 5).map(channel => ({
				channel: channel.channelID,
				originalId: channel.channelID,
				amount: channel.amount,
			}));

			// Fetch user stats directly from user_stats collection
			const userStats = await pb
				.collection(user_stats_collection)
				.getFullList({
					filter: `guildID ?= "${guild.id}"`,
					sort: "-totalMessages",
				});

			// Take top 5 users
			const activeUsers = userStats.slice(0, 5).map(user => ({
				author: user.authorID,
				originalId: user.authorID,
				amount: user.totalMessages,
			}));

			// Fetch hourly stats and aggregate by hour
			const hourlyStats = await pb
				.collection(hourly_stats_collection)
				.getFullList({
					filter: `guildID ?= "${guild.id}"`,
				});

			// Initialize hourly data structure
			const activeHourData = [];
			for (let hour = 0; hour < 24; hour++) {
				activeHourData.push({ 
					hour: hour.toString().padStart(2, '0'), 
					amount: 0 
				});
			}

			// Aggregate messages by hour
			for (const stat of hourlyStats) {
				const hourIndex = parseInt(stat.hour);
				if (hourIndex >= 0 && hourIndex < 24) {
					activeHourData[hourIndex].amount += stat.messages || 0;
				}
			}

			// Prepare data for Discord API call
			const discordDataOUT = [{ channels: [], users: [] }];
			for (const item of activeChannels) {
				discordDataOUT[0].channels.push(item.channel);
			}
			for (const item of activeUsers) {
				discordDataOUT[0].users.push(item.author);
			}

			// Fetch Discord names/info
			const discordDataIN_Req = await fetch(
				`${process.env.NEXT_PUBLIC_BOT_API_URL}/fetchID/${guild.discordID}`,
				{
					body: JSON.stringify(discordDataOUT),
					headers: {
						"Content-Type": "application/json",
					},
					method: "POST",
				},
			);
			const discordDataIN = await discordDataIN_Req.json();

			// Map Discord names
			const channelMap = {};
			const userMap = {};

			if (discordDataIN.newChannels && discordDataIN.newChannels.length > 0) {
				for (const channel of discordDataIN.newChannels) {
					channelMap[channel.id] = channel.name;
				}
			}

			if (discordDataIN.newUsers && discordDataIN.newUsers.length > 0) {
				for (const user of discordDataIN.newUsers) {
					userMap[user.id] = user.name;
				}
			}

			// Update with Discord names
			const finalActiveChannels = activeChannels.map((channel) => ({
				channel: channelMap[channel.channel] || channel.channel,
				originalId: channel.originalId,
				amount: channel.amount,
			}));

			const finalActiveUsers = activeUsers.map((user) => ({
				author: userMap[user.author] || user.author,
				originalId: user.originalId,
				amount: user.amount,
			}));

			const generalData = [
				{
					online: guild.online,
					idle: guild.idle,
					offline: guild.offline,
					total: guild.members,
				},
			];

			const finalData = [];
			finalData.push({
				ChannelData: finalActiveChannels,
				ActiveUsersData: finalActiveUsers,
				ActiveHourData: activeHourData,
				ID: discordDataIN,
				GeneralData: generalData,
			});

			return Response.json({ finalData });
		} catch (err) {
			const notFound = [{ errorCode: 404 }];
			console.log(err);
			return Response.json({ notFound });
		}
	} catch (err) {
		if (err.status === 400) {
			const notFound = [{ errorCode: 404 }];
			return Response.json({ notFound });
		}
	}
}