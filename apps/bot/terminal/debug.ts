import path from "node:path";
import dotenv from "dotenv";
import "colors";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const debugging_status = process.env.DEBUGGING;

export function debug({ text }: { text: string }): void {
  if (debugging_status === "TRUE") {
    console.log(`${"\n[DEBUG] ".yellow}${text}`);
  }
}
