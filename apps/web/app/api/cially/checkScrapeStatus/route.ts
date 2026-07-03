import { handleError } from "@/components/errorHandler";
import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const guild_collection_name: string = process.env.GUILDS_COLLECTION || "guilds";
const pb = new PocketBase(url);

export async function GET() {
  try {
    await pb
      .collection("_superusers")
      .authWithPassword(
        String(process.env.POCKETBASE_ADMIN_EMAIL),
        String(process.env.POCKETBASE_ADMIN_PASSWORD),
      );

    const scrapedGuild = await pb
      .collection(guild_collection_name)
      .getFirstListItem("beingScraped=true", {});

    const guildName = scrapedGuild.name;

    return Response.json({ server: guildName });
  } catch (error: any) {
    if (error.status === 404) {
      return Response.json({ noServer: true });
    }
    handleError(error);
    return Response.json({ code: 500 });
  }
}
