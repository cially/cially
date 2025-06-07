const { debug } = require("../../../../../terminal/debug");
const { error } = require("../../../../../terminal/error");

const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

// CONFIGURATION - Define action for each collection
const COLLECTIONS_CONFIG = {
	messages: {
		action: "delete", // Delete entire records
	},
	hourly_stats: {
		action: "clean",
		fieldsToEmpty: ["messages"],
		emptyValue: 0, // What to set number fields to
	},
	channel_stats: {
		action: "clean",
		fieldsToEmpty: ["amount"],
		emptyValue: "",
	},
	user_stats: {
		action: "clean",
		fieldsToEmpty: ["totalMessages", "totalMessageLength"],
		emptyValue: "",
	},
};

const guild_collection_name = process.env.GUILD_COLLECTION;

async function pbCollectionAutoDelete(guildID) {
	await pb
		.collection("_superusers")
		.authWithPassword(
			process.env.POCKETBASE_ADMIN_EMAIL,
			process.env.POCKETBASE_ADMIN_PASSWORD,
		);

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
				debug({
					text: `Sending batch with ${batchCount} deletions for ${collectionName}...`,
				});
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
			debug({
				text: `Sending final batch with ${batchCount} deletions for ${collectionName}...`,
			});
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

	async function bulkFieldUpdate(records, collectionName, config) {
		let batch = pb.createBatch();
		let batchCount = 0;
		let totalUpdated = 0;
		const batchSize = 20000;

		// Prepare the update data based on configuration
		const updateData = {};

		if (config.fieldDefaults) {
			// Use specific defaults for each field
			Object.assign(updateData, config.fieldDefaults);
		} else {
			// Use the same empty value for all fields
			config.fieldsToEmpty.forEach((field) => {
				updateData[field] = config.emptyValue;
			});
		}

		for (let i = 0; i < records.length; i++) {
			const record = records[i];

			if (batchCount < batchSize) {
				batch.collection(collectionName).update(record.id, updateData);
				batchCount++;
				totalUpdated++;
			} else {
				debug({
					text: `Sending batch with ${batchCount} updates for ${collectionName}...`,
				});
				try {
					await batch.send();
					debug({
						text: `Batch sent successfully for ${collectionName}. ${totalUpdated} records updated so far.`,
					});
				} catch (batchError) {
					error({ text: `Failed to send batch for ${collectionName}:` });
					console.log(batchError);
					throw batchError;
				}

				batch = pb.createBatch();
				batch.collection(collectionName).update(record.id, updateData);
				batchCount = 1;
				totalUpdated++;
			}
		}

		if (batchCount > 0) {
			debug({
				text: `Sending final batch with ${batchCount} updates for ${collectionName}...`,
			});
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
			updated: totalUpdated,
			batches: Math.ceil(records.length / batchSize),
			fieldsCleared: Object.keys(updateData),
		};
	}

	try {
		const guild = await pb
			.collection(guild_collection_name)
			.getFirstListItem(`discordID="${guildID}"`, {});

		debug({ text: `Found guild: ${guild.id} for Discord ID: ${guildID}` });

		const results = {};
		let totalProcessed = 0;
		let totalBatches = 0;

		// Process each collection
		for (const [collectionName, config] of Object.entries(COLLECTIONS_CONFIG)) {
			if (!collectionName || !config || !config.action) {
				debug({ text: `Skipping ${collectionName} - no action configured` });
				continue;
			}

			debug({
				text: `Processing collection: ${collectionName} with action: ${config.action}`,
			});

			if (
				config.action === "clean" &&
				(!config.fieldsToEmpty || config.fieldsToEmpty.length === 0)
			) {
				debug({
					text: `Skipping ${collectionName} - no fields configured to clean`,
				});
				continue;
			}

			if (config.action === "clean") {
				debug({ text: `Fields to clean: ${config.fieldsToEmpty.join(", ")}` });
			}

			try {
				const records = await pb.collection(collectionName).getFullList({
					filter: `guildID="${guild.id}"`,
				});

				const actionText = config.action === "delete" ? "delete" : "update";
				debug({
					text: `Found ${records.length} records to ${actionText} in ${collectionName} for guild ${guildID}`,
				});

				if (records.length === 0) {
					debug({
						text: `No records found to ${actionText} in ${collectionName} for guild ${guildID}`,
					});
					results[collectionName] = {
						[config.action === "delete" ? "deleted" : "updated"]: 0,
						batches: 0,
						...(config.action === "clean" && { fieldsCleared: [] }),
					};
					continue;
				}

				let result;
				if (config.action === "delete") {
					debug({
						text: `Starting bulk deletion of ${records.length} records from ${collectionName}...`,
					});
					result = await bulkDeletion(records, collectionName);
					totalProcessed += result.deleted;
					debug({
						text: `Bulk deletion completed for ${collectionName}. Deleted ${result.deleted} records in ${result.batches} batches`,
					});
				} else if (config.action === "clean") {
					debug({
						text: `Starting bulk field cleaning of ${records.length} records from ${collectionName}...`,
					});
					result = await bulkFieldUpdate(records, collectionName, config);
					totalProcessed += result.updated;
					debug({
						text: `Bulk field cleaning completed for ${collectionName}. Updated ${result.updated} records in ${result.batches} batches. Cleared fields: ${result.fieldsCleared.join(", ")}`,
					});
				}

				results[collectionName] = result;
				totalBatches += result.batches;
			} catch (collectionError) {
				error({
					text: `Error processing collection ${collectionName} for guild ${guildID}:`,
				});
				console.log(collectionError);

				// Store error info but continue with other collections
				results[collectionName] = {
					deleted: 0,
					updated: 0,
					batches: 0,
					fieldsCleared: [],
					error: collectionError.message || "Unknown error",
				};
			}
		}

		debug({
			text: `Multi-collection processing completed. Total processed: ${totalProcessed} records across ${totalBatches} batches for guild ${guildID}`,
		});

		return {
			guild: guildID,
			totalProcessed,
			totalBatches,
			collections: results,
		};
	} catch (err) {
		if (err.status === 404) {
			error({ text: `Guild with Discord ID ${guildID} not found in database` });
		} else if (err.name === "ClientResponseError") {
			error({
				text: `PocketBase API error during processing for guild ${guildID}:`,
			});
			console.log(`Status: ${err.status}, Message: ${err.message}`);
		} else {
			error({
				text: `Unexpected error during processing for guild ${guildID}:`,
			});
			console.log(err);
		}

		throw err;
	}
}

module.exports = { pbCollectionAutoDelete };
