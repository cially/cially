import path from "node:path";
import dotenv from "dotenv";
import get from "simple-get";
import { debug } from "../terminal/debug";
import { error } from "../terminal/error";
import "colors";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const API_URL = process.env.API_URL;

export interface SendPostRequestOptions {
  data: any;
  guildId: string;
  type: string;
}

export function sendPostRequest({ data, guildId, type }: SendPostRequestOptions): void {
  try {
    debug({ text: "HTTP Request sent" });

    const opts = {
      url: `${API_URL}/${type}/${guildId}/`,
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    };

    get.post(opts, (_err: any, res: any) => {
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
}
