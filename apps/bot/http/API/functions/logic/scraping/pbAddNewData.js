const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);
const guild_collection_name = process.env.GUILD_COLLECTION;
const collection_name = process.env.MESSAGE_COLLECTION;
const { debug } = require("../../../../../terminal/debug");
const { error } = require("../../../../../terminal/error");

async function pbAddNewData({ guildID, data }) {
  // Bulk addition function with proper scope
  await pb
    .collection("_superusers")
    .authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL,
      process.env.POCKETBASE_ADMIN_PASSWORD,
    );
  async function bulkAddition(messages, guildRecord) {
    let batch = pb.createBatch();
    let batchCount = 0;
    let totalCreated = 0;
    const batchSize = 20000;

    for (let i = 0; i < messages.length; i++) {
      const originalMessage = messages[i];

      const messageData = {
        messageID: originalMessage.messageID,
        author: originalMessage.author,
        guildID: guildRecord.id,
        messageLength: originalMessage.messageLength,
        channelID: originalMessage.channelID,
        messageCreation: originalMessage.created,
      };

      if (batchCount < batchSize) {
        batch.collection(collection_name).create(messageData);
        batchCount++;
        totalCreated++;
      } else {
        // Send current batch
        debug({ text: `Sending batch with ${batchCount} creations...` });
        try {
          await batch.send();
          debug({
            text: `Batch sent successfully. ${totalCreated} messages created so far.`,
          });
        } catch (batchError) {
          error({ text: `Failed to send batch:` });
          console.log(batchError);
          throw batchError;
        }

        batch = pb.createBatch();
        batch.collection(collection_name).create(messageData);
        batchCount = 1;
        totalCreated++;
      }
    }

    if (batchCount > 0) {
      debug({ text: `Sending final batch with ${batchCount} creations...` });
      try {
        await batch.send();
        debug({ text: `Final batch sent successfully.` });
      } catch (finalBatchError) {
        error({ text: `Failed to send final batch:` });
        console.log(finalBatchError);
        throw finalBatchError;
      }
    }

    return {
      created: totalCreated,
      batches: Math.ceil(messages.length / batchSize),
    };
  }
  try {
    // First, get the guild record
    const guild = await pb
      .collection(guild_collection_name)
      .getFirstListItem(`discordID="${guildID}"`, {});

    debug({ text: `Found guild: ${guild.id} for Discord ID: ${guildID}` });

    if (!data || !Array.isArray(data) || data.length === 0) {
      debug({ text: `No data provided to add for guild ${guildID}` });
      return { created: 0, batches: 0 };
    }

    debug({ text: `Ready to add ${data.length} message items to database` });

    debug({ text: `Starting bulk addition of ${data.length} messages...` });
    const result = await bulkAddition(data, guild);

    debug({
      text: `Bulk addition completed. Created ${result.created} messages in ${result.batches} batches for guild ${guildID}`,
    });

    return result;
  } catch (err) {
    if (err.status === 404) {
      error({ text: `Guild with Discord ID ${guildID} not found in database` });
    } else if (err.name === "ClientResponseError") {
      error({
        text: `PocketBase API error during data addition for guild ${guildID}:`,
      });
      console.log(`Status: ${err.status}, Message: ${err.message}`);
    } else {
      error({
        text: `Something went wrong after attempting to add message items into the database for guild ${guildID}:`,
      });
      console.log(err);
    }

    throw err;
  }
}

module.exports = { pbAddNewData };
