import fs from "node:fs";
import path from "node:path";
import { Client, Collection } from "discord.js";
import dotenv from "dotenv";
import "colors";
import { error } from "./terminal/error";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const token = process.env.TOKEN;

const client = new Client({
  intents: 53_608_447,
});

client.commands = new Collection();

async function main() {
  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      try {
        const command = await import(filePath);
        if (command && "data" in command && "execute" in command) {
          client.commands.set(command.data.name, command);
        } else {
          error({
            text: `The command at ${filePath} is missing a required "data" or "execute" property.`,
          });
        }
      } catch (err) {
        error({ text: `Failed to load command at ${filePath}: ${err}` });
      }
    }
  }

  // Event Handler
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
      const event = await import(filePath);
      if (event) {
        if (event.once) {
          client.once(event.name, (...args: any[]) => event.execute(...args));
        } else {
          client.on(event.name, (...args: any[]) => event.execute(...args));
        }
      }
    } catch (err) {
      error({ text: `Failed to load event at ${filePath}: ${err}` });
    }
  }

  // Log in to Discord with client's token
  client.login(token);
}

main().catch((err) => {
  error({ text: `Failed to start bot: ${err}` });
});
