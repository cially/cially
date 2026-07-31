import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = "guilds";
const voice_channels_stats_collection = "voice_channels_stats";
const user_stats_collection = "user_stats";
const hourly_stats_collection = "hourly_stats";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await pb
      .collection("_superusers")
      .authWithPassword(
        String(process.env.POCKETBASE_ADMIN_EMAIL),
        String(process.env.POCKETBASE_ADMIN_PASSWORD),
      );

    const guild = await pb
      .collection(guild_collection_name)
      .getFirstListItem(`discordID='${id}'`, {});

    try {
      // 1. Fetch Top Voice Channels Stats (ranked by total_vc_time)
      const vcChannelStats = await pb
        .collection(voice_channels_stats_collection)
        .getFullList({
          filter: `guildID ?= "${guild.id}"`,
          sort: "-total_vc_time",
        });

      const activeChannels = vcChannelStats.slice(0, 10).map((channel) => ({
        channel: channel.channelID,
        originalId: channel.channelID,
        amount: Number(channel.total_vc_time) || 0,
      }));

      // 2. Fetch Top Voice Users Stats (ranked by vc_time)
      const userStats = await pb
        .collection(user_stats_collection)
        .getFullList({
          filter: `guildID ?= "${guild.id}" && vc_time > 0`,
          sort: "-vc_time",
        });

      const activeUsers = userStats.slice(0, 10).map((user) => ({
        author: user.authorID,
        originalId: user.authorID,
        amount: Number(user.vc_time) || 0,
      }));

      // 3. Resolve IDs to names using bot's fetchID API
      const discordDataOUT: { channels: string[]; users: string[] }[] = [{ channels: [], users: [] }];

      for (const item of activeChannels) {
        discordDataOUT[0].channels.push(item.channel);
      }
      for (const item of activeUsers) {
        discordDataOUT[0].users.push(item.author);
      }

      let channelMap: Record<string, string> = {};
      let userMap: Record<string, string> = {};

      try {
        const discordDataIN_Req = await fetch(
          `${process.env.API_URL}/fetchID/${guild.discordID}`,
          {
            body: JSON.stringify(discordDataOUT),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          },
        );
        const discordDataIN = await discordDataIN_Req.json();

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
      } catch (err) {
        console.error("Failed to resolve discord IDs:", err);
      }

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

      // 4. Fetch 24h Hourly Joins / Leaves
      const todayDate = new Date();
      const todayDate_formatted = `${todayDate.getUTCFullYear()}-${(todayDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${todayDate.getUTCDate().toString().padStart(2, "0")}`;

      const hourlyStats = await pb
        .collection(hourly_stats_collection)
        .getFullList({
          filter: `guildID = "${guild.id}" && date = "${todayDate_formatted}"`,
          sort: "hour",
        });

      const hourData = [];
      for (let i = 0; i < 24; i++) {
        const hourString = i.toString().padStart(2, "0");
        const existingStat = hourlyStats.find(
          (stat) => stat.hour === hourString,
        );

        hourData.push({
          hour: hourString,
          joins: Number(existingStat?.vc_joins) || 0,
          leaves: Number(existingStat?.vc_leaves) || 0,
          unique_users: Number(existingStat?.vc_users) || 0,
        });
      }

      // 5. Fetch 7d Daily Joins / Leaves
      const weekData = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const currentDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const currentDate_formatted = `${currentDate.getUTCFullYear()}-${(currentDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${currentDate.getUTCDate().toString().padStart(2, "0")}`;
        const displayDate = `${(currentDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${currentDate.getUTCDate().toString().padStart(2, "0")}`;

        const dayStats = await pb
          .collection(hourly_stats_collection)
          .getFullList({
            filter: `guildID = "${guild.id}" && date = "${currentDate_formatted}"`,
          });

        const dayTotal = dayStats.reduce(
          (acc, stat) => ({
            joins: acc.joins + (Number(stat.vc_joins) || 0),
            leaves: acc.leaves + (Number(stat.vc_leaves) || 0),
            unique_users: Math.max(
              acc.unique_users,
              Number(stat.vc_users) || 0,
            ),
          }),
          { joins: 0, leaves: 0, unique_users: 0 },
        );

        weekData.push({
          date: displayDate,
          joins: dayTotal.joins,
          leaves: dayTotal.leaves,
          unique_users: dayTotal.unique_users,
        });
      }

      // 6. Fetch 4w Weekly Joins / Leaves
      let fourWeekData = [];
      let w = 0;

      while (w < 22) {
        const startingDate = new Date(Date.now() - w * 24 * 60 * 60 * 1000);
        const startingDate_formatted = `${startingDate.getUTCFullYear()}-${(startingDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${startingDate.getUTCDate().toString().padStart(2, "0")}`;
        const startingDate_factor = startingDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        const endingDate = new Date(Date.now() - (7 + w) * 24 * 60 * 60 * 1000);
        const endingDate_formatted = `${endingDate.getUTCFullYear()}-${(endingDate.getUTCMonth() + 1).toString().padStart(2, "0")}-${endingDate.getUTCDate().toString().padStart(2, "0")}`;

        const weekStats = await pb
          .collection(hourly_stats_collection)
          .getFullList({
            filter: `guildID = "${guild.id}" && date >= "${endingDate_formatted}" && date <= "${startingDate_formatted}"`,
          });

        const weekTotal = weekStats.reduce(
          (acc, stat) => ({
            joins: acc.joins + (Number(stat.vc_joins) || 0),
            leaves: acc.leaves + (Number(stat.vc_leaves) || 0),
            unique_users: Math.max(
              acc.unique_users,
              Number(stat.vc_users) || 0,
            ),
          }),
          { joins: 0, leaves: 0, unique_users: 0 },
        );

        fourWeekData.push({
          factor: startingDate_factor,
          starting_date: {
            startingDate_formatted,
            startingDate_ms: startingDate.getTime(),
          },
          finishing_date: {
            endingDate_formatted,
            endingDate_ms: endingDate.getTime(),
          },
          joins: weekTotal.joins,
          leaves: weekTotal.leaves,
          unique_users: weekTotal.unique_users,
        });
        w = w + 7;
      }
      fourWeekData = fourWeekData.toReversed();

      // 7. Calculate Aggregated / General Data
      const calculateGeneralStats = (data: { joins: number; leaves: number; unique_users: number }[], period: string) => {
        const totals = data.reduce(
          (acc, item) => ({
            joins: acc.joins + item.joins,
            leaves: acc.leaves + item.leaves,
            unique_users: acc.unique_users + item.unique_users,
          }),
          { joins: 0, leaves: 0, unique_users: 0 },
        );

        const joinToLeaveRatio =
          totals.leaves > 0
            ? (totals.joins / totals.leaves).toFixed(2)
            : totals.joins > 0
              ? "∞"
              : "0";
        const joinToUniqueRatio =
          totals.unique_users > 0
            ? (totals.joins / totals.unique_users).toFixed(2)
            : totals.joins > 0
              ? "∞"
              : "0";
        const leaveToUniqueRatio =
          totals.unique_users > 0
            ? (totals.leaves / totals.unique_users).toFixed(2)
            : totals.leaves > 0
              ? "∞"
              : "0";
        const netGrowth = totals.joins - totals.leaves;
        const averageJoinsPerDay =
          period === "today"
            ? totals.joins
            : (totals.joins / data.length).toFixed(2);
        const averageLeavesPerDay =
          period === "today"
            ? totals.leaves
            : (totals.leaves / data.length).toFixed(2);
        const averageUniqueUsersPerDay =
          period === "today"
            ? totals.unique_users
            : (totals.unique_users / data.length).toFixed(2);

        return {
          period,
          total_joins: totals.joins,
          total_leaves: totals.leaves,
          total_unique_users: totals.unique_users,
          net_growth: netGrowth,
          join_to_leave_ratio: joinToLeaveRatio,
          join_to_unique_ratio: joinToUniqueRatio,
          leave_to_unique_ratio: leaveToUniqueRatio,
          average_joins_per_day: averageJoinsPerDay,
          average_leaves_per_day: averageLeavesPerDay,
          average_unique_users_per_day: averageUniqueUsersPerDay,
        };
      };

      const generalData = [
        calculateGeneralStats(hourData, "today"),
        calculateGeneralStats(weekData, "week"),
        calculateGeneralStats(fourWeekData, "month"),
      ];

      // Sum up all total_vc_time from all active channels to get guild totals
      const totalVoiceTime = vcChannelStats.reduce(
        (sum, channel) => sum + (Number(channel.total_vc_time) || 0),
        0,
      );

      // Sum up all joins from hourly stats
      let totalVCJoins = 0;
      try {
        const allVCStats = await pb
          .collection(hourly_stats_collection)
          .getFullList({
            filter: `guildID = "${guild.id}" && vc_joins > 0`,
          });
        totalVCJoins = allVCStats.reduce(
          (sum, stat) => sum + (Number(stat.vc_joins) || 0),
          0,
        );
      } catch (err) {
        console.error("Failed to query all vc joins:", err);
      }

      const finalData = [{
        ChannelData: finalActiveChannels,
        ActiveUsersData: finalActiveUsers,
        HourData: hourData,
        WeekData: weekData,
        FourWeekData: fourWeekData,
        GeneralData: generalData,
        TotalVoiceTime: totalVoiceTime,
        TotalVCChannels: vcChannelStats.length,
        TotalVCUsers: userStats.length,
        TotalVCJoins: totalVCJoins,
      }];

      return Response.json({ finalData });
    } catch (err: any) {
      const notFound = [{ errorCode: 404 }];
      console.error("Inner error:", err);
      return Response.json({ notFound });
    }
  } catch (err: any) {
    if (err.status === 400) {
      const notFound = [{ errorCode: 404 }];
      return Response.json({ notFound });
    }
    const serverError = [{ errorCode: 500 }];
    console.error("Outer error:", err);
    return Response.json({ serverError });
  }
}
