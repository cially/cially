const express = require("express");
const app = express();
const port = process.env.PORT;
const bodyParser = require("body-parser");

// Functions for each API route
const { syncGuild } = require("./functions/syncGuild");
const { messageCreate } = require("./functions/messageCreate");
const { inviteCreate } = require("./functions/inviteCreate");
const { guildMemberRemove } = require("./functions/guildMemberRemove");
const { guildMemberAdd } = require("./functions/guildMemberAdd");
const { fetchID } = require("./functions/fetchID");
const { fetchGuilds } = require("./functions/fetchGuilds");
const { messageDelete } = require("./functions/messageDelete");
const { messageEdit } = require("./functions/messageEdit");
const { fetchUserData } = require("./functions/fetchUserData");
const { serverScrape } = require("./functions/serverScrape");

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// API Routes
async function API(client) {
	// Main Listener
	app.listen(port, () => {
		console.log(`[SUCCESS] `.green + `The API is running on port: ${port}! \n`);
	});

	// GET Routes
	app.get("/syncGuild/:guildID", (req, res) => {
		syncGuild(req, res, client);
	});

	app.get("/fetchGuilds", (req, res) => {
		fetchGuilds(req, res, client);
	});

	app.get("/serverScrape/:guildID", (req, res) => {
		serverScrape(req, res, client);
	});

	// POST Routes
	app.post("/messageCreate/:guildID", (req, res) => {
		messageCreate(req, res, client);
	});

	app.post("/inviteCreate/:guildID", (req, res) => {
		inviteCreate(req, res, client);
	});

	app.post("/guildMemberAdd/:guildID", (req, res) => {
		guildMemberAdd(req, res, client);
	});

	app.post("/guildMemberRemove/:guildID", (req, res) => {
		guildMemberRemove(req, res, client);
	});

	app.post("/fetchID/:guildID", (req, res) => {
		fetchID(req, res, client);
	});

	app.post("/messageDelete/:guildID", (req, res) => {
		messageDelete(req, res, client);
	});

	app.post("/messageEdit/:guildID", (req, res) => {
		messageEdit(req, res, client);
	});

	app.post("/fetchUserData/:guildID", (req, res) => {
		fetchUserData(req, res, client);
	});
}

module.exports = { API };
