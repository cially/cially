import get from "simple-get";
import { debug } from "../../../../terminal/debug";
import { error } from "../../../../terminal/error";
import PocketBase from "pocketbase";
import "colors";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = process.env.GUILD_COLLECTION;
const API_URL = process.env.API_URL;

export async function registerGuild(guildID: string): Promise<void> {
  debug({ text: "Guild is not in the database. Attempting to add it..." });

  const guildData = { discordID: guildID };
  try {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      await pb
        .collection("_superusers")
        .authWithPassword(adminEmail, adminPassword);
    }

    if (guild_collection_name) {
      await pb.collection(guild_collection_name).create(guildData);
    }
    debug({ text: "Guild has been added to the database" });

    try {
      const opts = {
        url: `${API_URL}/syncGuild/${guildID}/`,
      };

      get.get(opts, (_err: any, res: any) => {
        try {
          res.pipe(process.stdout);

          res.on("data", () => {
            debug({ text: "Response received and HTTP communication ended" });
          });
        } catch (err: any) {
          if (
            String(err.message).includes(
              `Cannot read properties of undefined (reading 'pipe')`
            )
          ) {
            error({
              text:
                `Looks like the bot can't communicate with ` +
                (opts.url as any).blue +
                "\n  Check that you provided the correct URL and that the API is online and accessible.",
            });
          } else {
            error({
              text: `Something went wrong while trying to communicate with the API: \n${err}`,
            });
          }
        }
      });
    } catch (err: any) {
      error({
        text: `Something went wrong while trying to communicate with the API: \n${err}`,
      });
    }
  } catch (err: any) {
    debug({ text: `Failed to create new guild: \n${err}` });
  }
}
