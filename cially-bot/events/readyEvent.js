// Imports
const { Events } = require("discord.js");
const cfonts = require("cfonts");
const { debug } = require("../terminal/debug");
const { error } = require("../terminal/error");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = require("fs");
const path = require("node:path");
const { API } = require("../http/API/API");

// Main Event
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		// Cool Console Title :P (serves no point at all)
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

		// Logs
		debug({ text: `Client Found: ${client.user.tag}` });
		console.log(
			`[SUCCESS] `.green +
				`The Bot is Running! \n\n-----------LOGS------------\n\n`,
		);

		// Sync of slash commands
		syncCommands(client);

		// Start the API
		API(client);
	},
};

// Function to sync commands (add new ones, remove deleted ones)
async function syncCommands(client) {
	const localCommands = [];
	const foldersPath = path.join(__dirname, "..", "commands");
	const commandFolders = fs.readdirSync(foldersPath);

	// Get all local commands
	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = fs
			.readdirSync(commandsPath)
			.filter((file) => file.endsWith(".js"));

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			// Clear cache to ensure we get the latest version
			delete require.cache[require.resolve(filePath)];
			const command = require(filePath);

			if ("data" in command && "execute" in command) {
				localCommands.push({
					name: command.data.name,
					data: command.data.toJSON(),
				});
			}
		}
	}

	const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

	try {
		// Get existing registered commands
		const existingCommands = await rest.get(
			Routes.applicationCommands(client.user.id),
		);

		debug({ text: `Found ${existingCommands.length} existing commands` });

		// Find commands to delete (exist on Discord but not in local files)
		for (const command of existingCommands) {
			const localCommand = localCommands.find(
				(cmd) => cmd.name === command.name,
			);
			if (!localCommand) {
				// Delete command that no longer exists locally
				await rest.delete(
					Routes.applicationCommand(client.user.id, command.id),
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
	} catch (err) {
		error({ text: "Error syncing commands", error: err });
	}
}
