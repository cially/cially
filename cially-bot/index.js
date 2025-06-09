// Package Imports
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const { REST, Routes } = require("discord.js");
var colors = require("colors");
const { debug } = require("./terminal/debug");
const { error } = require("./terminal/error");

// Config Imports from .env
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;

// Currently using every single intent.
// Using https://discord-intents-calculator.vercel.app/ to generate the intents ID
const client = new Client({
	intents: 53608447,
});

// Command Handler
client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
		} else {
			error({
				text: `The command at ${filePath} is missing a required "data" or "execute" property.`,
			});
		}
	}
}

// Event Handler
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
	.readdirSync(eventsPath)
	.filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Log in to Discord with client's token
client.login(token);
