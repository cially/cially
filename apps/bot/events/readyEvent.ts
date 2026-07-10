import { Client, Events } from "discord.js";
import cfonts from "cfonts";
import { debug } from "../terminal/debug";
import { error } from "../terminal/error";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import fs from "node:fs";
import path from "node:path";
import { API } from "../http/API/API";
import { setAllScrapeStatusesFalse } from "../http/API/functions/logic/scraping/switchScrapeStatus";

async function syncCommands(client: Client) {
  const localCommands: { name: string; data: any }[] = [];
  const foldersPath = path.join(__dirname, "..", "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  // Get all local commands
  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      try {
        const command = await import(filePath + "?update=" + Date.now());
        if (command && "data" in command && "execute" in command) {
          localCommands.push({
            name: command.data.name,
            data: command.data.toJSON(),
          });
        }
      } catch (err) {
        error({ text: `Failed to load command during sync at ${filePath}: ${err}` });
      }
    }
  }

  const token = process.env.TOKEN;
  if (!token) {
    error({ text: "No bot token provided in environment variables." });
    return;
  }
  const rest = new REST({ version: "10" }).setToken(token);

  try {
    if (!client.user) return;
    const existingCommands = (await rest.get(
      Routes.applicationCommands(client.user.id)
    )) as any[];

    debug({ text: `Found ${existingCommands.length} existing commands` });

    // Find commands to delete (exist on Discord but not in local files)
    for (const command of existingCommands) {
      const localCommand = localCommands.find(
        (cmd) => cmd.name === command.name
      );
      if (!localCommand) {
        // Delete command that no longer exists locally
        await rest.delete(
          Routes.applicationCommand(client.user.id, command.id)
        );
        debug({ text: `Deleted command: ${command.name}` });
      }
    }

    // Register all current commands
    if (localCommands.length > 0) {
      const commandsToRegister = localCommands.map((cmd) => cmd.data);

      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commandsToRegister,
      });

      debug({
        text: `Successfully registered ${commandsToRegister.length} commands globally`,
      });
    }
  } catch (err: any) {
    error({ text: "Error syncing commands: " + err });
  }
}

export const name = Events.ClientReady;
export const once = true;
export function execute(client: Client) {
  // Cool Console Title
  cfonts.say("CIALLY", {
    font: "block",
    align: "center",
    colors: ["blue"],
    background: "transparent",
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    env: "node",
  });

  debug({ text: `Client Found: ${client.user?.tag}` });
  console.log(
    "[SUCCESS] ".green +
      "The Bot is Running! \n\n-----------LOGS------------\n\n"
  );

  // Sync slash commands
  syncCommands(client);

  // Start the API
  API(client);

  // Set all scrape statuses to false in case some scraping procedure got cut off
  setAllScrapeStatusesFalse();
}
