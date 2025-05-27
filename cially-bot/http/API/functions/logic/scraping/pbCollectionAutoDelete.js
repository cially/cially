const { debug } = require("../../../../../terminal/debug");
const { error } = require("../../../../../terminal/error");

const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

const guild_collection_name = process.env.GUILD_COLLECTION;
const collection_name = process.env.MESSAGE_COLLECTION;

async function pbCollectionAutoDelete(guildID) {
	async function bulkDeletion(records) {
		let batch = pb.createBatch();
		let batchCount = 0;
		let totalDeleted = 0;
		const batchSize = 20000;

		for (let i = 0; i < records.length; i++) {
			const message = records[i];

			if (batchCount < batchSize) {
				batch.collection(collection_name).delete(message.id);
				batchCount++;
				totalDeleted++;
			} else {
				debug({ text: `Sending batch with ${batchCount} deletions...` });
				try {
					await batch.send();
					debug({
						text: `Batch sent successfully. ${totalDeleted} messages deleted so far.`,
					});
				} catch (batchError) {
					error({ text: `Failed to send batch:` });
					console.log(batchError);
					throw batchError;
				}

				batch = pb.createBatch();
				batch.collection(collection_name).delete(message.id);
				batchCount = 1;
				totalDeleted++;
			}
		}

		if (batchCount > 0) {
			debug({ text: `Sending final batch with ${batchCount} deletions...` });
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
			deleted: totalDeleted,
			batches: Math.ceil(records.length / batchSize),
		};
	}

	try {
		const guild = await pb
			.collection(guild_collection_name)
			.getFirstListItem(`discordID="${guildID}"`, {});

		debug({ text: `Found guild: ${guild.id} for Discord ID: ${guildID}` });

		const message_records = await pb.collection(collection_name).getFullList({
			filter: `guildID="${guild.id}"`,
		});

		debug({
			text: `Found ${message_records.length} messages to delete for guild ${guildID}`,
		});

		if (message_records.length === 0) {
			debug({ text: `No messages found to delete for guild ${guildID}` });
			return { deleted: 0, batches: 0 };
		}

		debug({
			text: `Starting bulk deletion of ${message_records.length} messages...`,
		});
		const result = await bulkDeletion(message_records);

		debug({
			text: `Bulk deletion completed. Deleted ${result.deleted} messages in ${result.batches} batches for guild ${guildID}`,
		});

		return result;
	} catch (err) {
		if (err.status === 404) {
			error({ text: `Guild with Discord ID ${guildID} not found in database` });
		} else if (err.name === "ClientResponseError") {
			error({
				text: `PocketBase API error during auto-delete for guild ${guildID}:`,
			});
			console.log(`Status: ${err.status}, Message: ${err.message}`);
		} else {
			error({
				text: `Unexpected error during auto-delete for guild ${guildID}:`,
			});
			console.log(err);
		}

		throw err;
	}
}

module.exports = { pbCollectionAutoDelete };
