const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);
const guild_collection_name = process.env.GUILD_COLLECTION;
const collection_name = process.env.MESSAGE_COLLECTION;

async function pbAddNewData({ guildID, data }) {
  try {
    const guild = await pb
      .collection(guild_collection_name)
      .getFirstListItem(`discordID?="${guildID}"`, {});

    console.log(guild);

    console.log(data);

    async function bulkAddition() {
      let batch = pb.createBatch();
      let i = 1;
      for await (let message of data) {
        message = {
          messageID: message.messageID,
          author: message.author,
          guildID: guild.id,
          messageLength: message.messageLength,
          channelID: message.channelID,
          messageCreation: message.created,
        };
        if (i < 20000) {
          batch.collection("messages").create(message);
          console.log(`added ${message.messageID} to the batch`);
          i = i + 1;
        } else {
          await batch.send();
          console.log("Max batch capacity reached. Creating a new batch...");
          batch = pb.createBatch();
          batch.collection("messages").create(message);
          i = 1;
        }
      }

      await console.log("batch over. ready to send");

      return await batch.send();
    }

    await console.log("ready to bulk add");
    let result = await bulkAddition();
    await console.log(result);
  } catch (err) {
    console.log(err);
  }
}

module.exports = { pbAddNewData };
