import express from "express";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import { Client } from "discord.js";
import "colors";

// Functions for each API route
import { syncGuild } from "./functions/syncGuild";
import { messageCreate } from "./functions/messageCreate";
import { inviteCreate } from "./functions/inviteCreate";
import { guildMemberRemove } from "./functions/guildMemberRemove";
import { guildMemberAdd } from "./functions/guildMemberAdd";
import { fetchID } from "./functions/fetchID";
import { fetchGuilds } from "./functions/fetchGuilds";
import { messageDelete } from "./functions/messageDelete";
import { messageEdit } from "./functions/messageEdit";
import { fetchUserData } from "./functions/fetchUserData";
import { serverScrape } from "./functions/serverScrape";

const app = express();
const port = process.env.API_PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const globalRateLimiter = rateLimit({
  windowMs: 1 * 1000, // 1 second
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: "Too many API requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function API(client: Client): Promise<void> {
  // Main Listener
  app.listen(port, () => {
    console.log(`${"[SUCCESS] ".green}The API is running on port: ${port}! \n`);
  });

  // GET Routes
  app.get("/syncGuild/:guildID", (req, res) => {
    syncGuild(req, res, client);
  });

  app.get("/fetchGuilds", globalRateLimiter, (req, res) => {
    fetchGuilds(req, res, client);
  });

  app.get("/serverScrape/:guildID", globalRateLimiter, (req, res) => {
    serverScrape(req, res, client);
  });

  // POST Routes
  app.post("/messageCreate/:guildID", globalRateLimiter, (req, res) => {
    messageCreate(req, res, client);
  });

  app.post("/inviteCreate/:guildID", globalRateLimiter, (req, res) => {
    inviteCreate(req, res, client);
  });

  app.post("/guildMemberAdd/:guildID", globalRateLimiter, (req, res) => {
    guildMemberAdd(req, res, client);
  });

  app.post("/guildMemberRemove/:guildID", globalRateLimiter, (req, res) => {
    guildMemberRemove(req, res, client);
  });

  app.post("/fetchID/:guildID", globalRateLimiter, (req, res) => {
    fetchID(req, res, client);
  });

  app.post("/messageDelete/:guildID", globalRateLimiter, (req, res) => {
    messageDelete(req, res, client);
  });

  app.post("/messageEdit/:guildID", globalRateLimiter, (req, res) => {
    messageEdit(req, res, client);
  });

  app.post("/fetchUserData/:guildID", globalRateLimiter, (req, res) => {
    fetchUserData(req, res, client);
  });
}
