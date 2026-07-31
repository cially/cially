import { debug } from "../../../../../terminal/debug";
import { error } from "../../../../../terminal/error";
import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

interface CollectionConfig {
  action: "delete" | "clean";
  fieldsToEmpty?: string[];
  emptyValue?: any;
  fieldDefaults?: Record<string, any>;
}

const COLLECTIONS_CONFIG: Record<string, CollectionConfig> = {
  messages: {
    action: "delete",
  },
  hourly_stats: {
    action: "clean",
    fieldsToEmpty: ["messages"],
    emptyValue: 0,
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

export async function pbCollectionAutoDelete(guildID: string): Promise<any> {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    await pb
      .collection("_superusers")
      .authWithPassword(adminEmail, adminPassword);
  }

  async function bulkDeletion(records: any[], collectionName: string) {
    let batch = pb.createBatch();
    let batchCount = 0;
    let totalDeleted = 0;
    const batchSize = 20_000;

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

  async function bulkFieldUpdate(records: any[], collectionName: string, config: CollectionConfig) {
    let batch = pb.createBatch();
    let batchCount = 0;
    let totalUpdated = 0;
    const batchSize = 20_000;

    const updateData: Record<string, any> = {};

    if (config.fieldDefaults) {
      Object.assign(updateData, config.fieldDefaults);
    } else if (config.fieldsToEmpty) {
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
    if (!guild_collection_name) {
      throw new Error("GUILD_COLLECTION not configured.");
    }
    const guild = await pb
      .collection(guild_collection_name)
      .getFirstListItem(`discordID="${guildID}"`, {});

    debug({ text: `Found guild: ${guild.id} for Discord ID: ${guildID}` });

    const results: Record<string, any> = {};
    let totalProcessed = 0;
    let totalBatches = 0;

    for (const [collectionName, config] of Object.entries(COLLECTIONS_CONFIG)) {
      if (!(collectionName && config && config.action)) {
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

      if (config.action === "clean" && config.fieldsToEmpty) {
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

        let result: any;
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
      } catch (collectionError: any) {
        error({
          text: `Error processing collection ${collectionName} for guild ${guildID}:`,
        });
        console.log(collectionError);

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
  } catch (err: any) {
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
