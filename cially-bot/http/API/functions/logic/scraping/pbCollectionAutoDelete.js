const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);
const guild_collection_name = process.env.GUILD_COLLECTION;
const collection_name = process.env.MESSAGE_COLLECTION;

async function pbCollectionAutoDelete(guildID) {
  try {
    const guild = await pb
      .collection(guild_collection_name)
      .getFirstListItem(`discordID?="${guildID}"`, {});

    console.log(guild);

    const message_records = await pb.collection(collection_name).getFullList({
      filter: `guildID?="${guild.id}"`,
    });

    console.log(message_records);

    async function bulkDeletion() {
      let batch = pb.createBatch();
      let i = 1;
      for await (const message of message_records) {
        if (i < 20000) {
          batch.collection("messages").delete(message.id);
          console.log(`added ${message.id} to the batch`);
          i = i + 1
        } else {
            await batch.send();
            console.log("Max batch capacity reached. Creating a new batch...")
            batch = pb.createBatch();
            batch.collection("messages").delete(message.id);
            i = 1
        }
      }


      await console.log("batch over. ready to send");

      return await batch.send();
    }

    await console.log("ready to bulk delete");
    let result = await bulkDeletion();
    await console.log(result);
  } catch (err) {
    console.log(err);
  }
}

module.exports = { pbCollectionAutoDelete };
