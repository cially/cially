const { debug } = require("../../../../../terminal/debug");
const { error } = require("../../../../../terminal/error");

const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

// TODO make only the message items being erased instead of all the data

// CONFIGURATION - Add your collection names here
const COLLECTIONS_TO_DELETE = [
	'messages',
	'hourly_stats',
	'channel_stats',
	'user_stats',
];

const guild_collection_name = process.env.GUILD_COLLECTION;

async function pbCollectionAutoDelete(guildID) {
	async function bulkDeletion(records, collectionName) {
		let batch = pb.createBatch();
		let batchCount = 0;
		let totalDeleted = 0;
		const batchSize = 20000;

		for (let i = 0; i < records.length; i++) {
			const record = records[i];

			if (batchCount < batchSize) {
				batch.collection(collectionName).delete(record.id);
				batchCount++;
				totalDeleted++;
			} else {
				debug({ text: `Sending batch with ${batchCount} deletions for ${collectionName}...` });
				try {
					await batch.send();
					debug({
						text: `Batch sent successfully for ${collectionName}. ${totalDeleted} records deleted so far.`,
					});
				} catch (batchError) {
					error({ text: `Failed to send batch for ${collectionName}:` });
					console.log(batchError);
					throw batchError;
				}

				batch = pb.createBatch();
				batch.collection(collectionName).delete(record.id);
				batchCount = 1;
				totalDeleted++;
			}
		}

		if (batchCount > 0) {
			debug({ text: `Sending final batch with ${batchCount} deletions for ${collectionName}...` });
			try {
				await batch.send();
				debug({ text: `Final batch sent successfully for ${collectionName}.` });
			} catch (finalBatchError) {
				error({ text: `Failed to send final batch for ${collectionName}:` });
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

		const results = {};
		let totalDeleted = 0;
		let totalBatches = 0;

		// Process each collection
		for (const collectionName of COLLECTIONS_TO_DELETE) {
			if (!collectionName) {
				debug({ text: `Skipping undefined collection name` });
				continue;
			}

			debug({ text: `Processing collection: ${collectionName}` });

			try {
				const records = await pb.collection(collectionName).getFullList({
					filter: `guildID="${guild.id}"`,
				});

				debug({
					text: `Found ${records.length} records to delete in ${collectionName} for guild ${guildID}`,
				});

				if (records.length === 0) {
					debug({ text: `No records found to delete in ${collectionName} for guild ${guildID}` });
					results[collectionName] = { deleted: 0, batches: 0 };
					continue;
				}

				debug({
					text: `Starting bulk deletion of ${records.length} records from ${collectionName}...`,
				});

				const result = await bulkDeletion(records, collectionName);
				results[collectionName] = result;
				totalDeleted += result.deleted;
				totalBatches += result.batches;

				debug({
					text: `Bulk deletion completed for ${collectionName}. Deleted ${result.deleted} records in ${result.batches} batches`,
				});

			} catch (collectionError) {
				error({
					text: `Error processing collection ${collectionName} for guild ${guildID}:`,
				});
				console.log(collectionError);
				
				// Store error info but continue with other collections
				results[collectionName] = { 
					deleted: 0, 
					batches: 0, 
					error: collectionError.message || 'Unknown error' 
				};
			}
		}

		debug({
			text: `Multi-collection deletion completed. Total deleted: ${totalDeleted} records across ${totalBatches} batches for guild ${guildID}`,
		});

		return {
			guild: guildID,
			totalDeleted,
			totalBatches,
			collections: results
		};

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