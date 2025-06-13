import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);
const guild_collection_name = "guilds";

export async function GET(
  _request: Request,
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
        await pb
          .collection("_superusers")
          .authWithPassword(
            process.env.POCKETBASE_ADMIN_EMAIL,
            process.env.POCKETBASE_ADMIN_PASSWORD,
          );

        const guild = await pb
          .collection(guild_collection_name)
          .getFirstListItem(`discordID='${id}'`, {});

        const today_msg_records = await pb
          .collection("hourly_stats")
          .getFullList({
            filter: `guildID = '${guild.id}' && date = '${date}'`,
            sort: "-date",
          });

        let today_msgs = 0;

        for (const today_msg_record of today_msg_records) {
          today_msgs = today_msgs + today_msg_record.messages;
        }

        const yesterday_msg_records = await pb
          .collection("hourly_stats")
          .getFullList({
            filter: `guildID = '${guild.id}' && date = '${previous_date}'`,
            sort: "-date",
          });

        let yesterday_msgs = 0;

        for (const yesterday_msg_record of yesterday_msg_records) {
          yesterday_msgs = yesterday_msgs + yesterday_msg_record.messages;
        }

        const msg_day_difference = today_msgs - yesterday_msgs;

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
            today_msg: today_msgs,
            msg_day_difference: msg_day_difference,
          },
        ];
        return Response.json({ guildFound });
      } catch (err) {
        if (err.status === 400) {
          console.log(err);
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
