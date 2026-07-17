import { debug } from "../../../../../terminal/debug";
import { error } from "../../../../../terminal/error";
import { pbAddNewData, ScrapedMessage } from "./pbAddNewData";
import { pbCollectionAutoDelete } from "./pbCollectionAutoDelete";
import {
  switchScrapeStatus,
  enableScrapeStatus,
} from "./switchScrapeStatus";
import { Client } from "discord.js";

export interface DiscordScrapeOptions {
  client: Client;
  guildID: string;
}

export async function discordScrape({ client, guildID }: DiscordScrapeOptions): Promise<any> {
  enableScrapeStatus(guildID);

  const maxTotalMessages = 1_000_000;
  const maxAgeWeeks = 4;
  const waitFor = 1069;
  const batchSize = 1000;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeWeeks * 7);
  const cutoffTimestamp = cutoffDate.getTime();

  let currentChannel = 0;
  let totalMessagesScraped = 0;
  let currentBatch: ScrapedMessage[] = [];
  let totalBatchesSaved = 0;
  let reachedGlobalLimit = false;
  let rateLimited = false;

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const toPocketBaseDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const pad = (num: number, size = 2) => String(num).padStart(size, "0");

    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());
    const milliseconds = pad(date.getUTCMilliseconds(), 3);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  };

  async function saveBatch() {
    if (currentBatch.length === 0) return;

    debug({ text: `Saving Batch: ${totalBatchesSaved + 1}` });
    try {
      await pbAddNewData({ guildID, data: currentBatch });
      totalBatchesSaved++;

      debug({
        text: `Total messages saved so far: ${totalBatchesSaved * batchSize + (currentBatch.length < batchSize ? currentBatch.length : 0)}`,
      });

      currentBatch = [];
    } catch (saveError) {
      error({
        text: `Failed to save batch ${totalBatchesSaved + 1}:`,
      });
      throw saveError;
    }
  }

  async function scrapeChannel(channelId: string) {
    try {
      if (rateLimited) {
        error({
          text: `Skipping channel ${channelId} - bot is rate limited`,
        });
        return {
          messagesScraped: 0,
          hitTimeLimit: false,
          hitGlobalLimit: false,
          rateLimited: true,
        };
      }

      const channel = await client.channels.fetch(channelId);
      if (!channel || channel.type !== 0) {
        debug({ text: `Skipping channel ${channelId} - not a text channel` });
        return {
          messagesScraped: 0,
          hitTimeLimit: false,
          hitGlobalLimit: false,
          rateLimited: false,
        };
      }

      const textChannel = channel as any;
      debug({ text: `Scraping channel: ${textChannel.name} (${channelId})` });

      let channelMessagesScraped = 0;
      let lastMessageId: string | null = null;
      let hasMoreMessages = true;
      let hitTimeLimit = false;
      let hitGlobalLimit = false;

      while (hasMoreMessages && !rateLimited) {
        if (totalMessagesScraped >= maxTotalMessages) {
          debug({
            text: `Reached global message limit of ${maxTotalMessages}`,
          });
          hitGlobalLimit = true;
          reachedGlobalLimit = true;
          break;
        }

        const remainingGlobalMessages = maxTotalMessages - totalMessagesScraped;
        const fetchBatchSize = Math.min(100, remainingGlobalMessages);

        const options: { limit: number; before?: string } = { limit: fetchBatchSize };

        if (lastMessageId) {
          options.before = lastMessageId;
        }

        try {
          const fetchedMessages = await textChannel.messages.fetch(options);

          if (fetchedMessages.size === 0) {
            hasMoreMessages = false;
            break;
          }

          const messageArray = Array.from(fetchedMessages.values()) as any[];
          let validMessagesInBatch = 0;

          for (const message of messageArray) {
            if (message.author.bot) {
              continue;
            }

            if (message.createdTimestamp < cutoffTimestamp) {
              debug({
                text: `Hit time limit (4 weeks) in channel ${textChannel.name}`,
              });

              hitTimeLimit = true;
              hasMoreMessages = false;
              break;
            }

            if (totalMessagesScraped >= maxTotalMessages) {
              debug({
                text: `Reached global message limit of ${maxTotalMessages}`,
              });

              hitGlobalLimit = true;
              reachedGlobalLimit = true;
              hasMoreMessages = false;
              break;
            }

            const messageData: ScrapedMessage = {
              messageID: message.id,
              author: message.author.id,
              messageLength: message.content
                .trim()
                .split(/\s+/)
                .filter((word: string) => word.length > 0).length,
              channelID: message.channelId,
              created: toPocketBaseDate(message.createdTimestamp),
            };

            currentBatch.push(messageData);
            totalMessagesScraped++;
            channelMessagesScraped++;
            validMessagesInBatch++;

            if (currentBatch.length >= batchSize) {
              debug({
                text: `Reached batch size of ${batchSize}, saving to database...`,
              });
              await saveBatch();
            }
          }

          lastMessageId = messageArray[messageArray.length - 1]?.id || null;

          if (
            hasMoreMessages &&
            fetchedMessages.size === fetchBatchSize &&
            !rateLimited
          ) {
            debug({
              text: `Waiting ${waitFor}ms before next batch... (${channelMessagesScraped} messages scraped from ${textChannel.name} so far, ${currentBatch.length} in current batch)`,
            });
            await wait(waitFor);
          }

          if (validMessagesInBatch === 0 && hitTimeLimit) {
            break;
          }
        } catch (fetchError: any) {
          if (
            fetchError.code === 50_013 ||
            fetchError.status === 429 ||
            fetchError.message.includes("rate limit")
          ) {
            error({
              text: "Rate limited detected! Stopping all scraping operations.",
            });

            console.log("Error details:", fetchError.message);
            rateLimited = true;
            break;
          }
          error({
            text: `Error fetching messages from ${textChannel.name}:`,
          });
          console.log(fetchError.message);
          break;
        }
      }

      const statusText = hitTimeLimit
        ? " (hit 4-week limit)"
        : hitGlobalLimit
          ? " (hit global limit)"
          : rateLimited
            ? " (rate limited)"
            : "";

      debug({
        text: `Scraped ${channelMessagesScraped} messages from ${textChannel.name}${statusText}`,
      });

      return {
        messagesScraped: channelMessagesScraped,
        hitTimeLimit,
        hitGlobalLimit,
        rateLimited,
      };
    } catch (channelError: any) {
      if (
        channelError.code === 50_013 ||
        channelError.status === 429 ||
        channelError.message.includes("rate limit")
      ) {
        error({
          text: `Rate limited when accessing channel ${channelId}! Stopping all operations.`,
        });

        rateLimited = true;
        return {
          messagesScraped: 0,
          hitTimeLimit: false,
          hitGlobalLimit: false,
          rateLimited: true,
        };
      }
      error({ text: `Error scraping channel ${channelId}:` });
      console.log(channelError);
      return {
        messagesScraped: 0,
        hitTimeLimit: false,
        hitGlobalLimit: false,
        rateLimited: false,
      };
    }
  }

  try {
    await pbCollectionAutoDelete(guildID);
    const discordGuild = await client.guilds.fetch(guildID);
    let channels = await discordGuild.channels.fetch();
    const channelsList = Array.from(channels.values());
    const channelArray: string[] = [];

    for (const channel of channelsList) {
      if (channel && channel.type === 0) {
        channelArray.push(channel.id);
      } else if (channel) {
        debug({
          text: `Ignoring ${channel.id} (${channel.name}) - type: ${channel.type}`,
        });
      }
    }

    debug({ text: "Scraping server started" });
    debug({ text: `Found ${channelArray.length} text channels to scrape` });

    for (const channelId of channelArray) {
      try {
        if (reachedGlobalLimit || rateLimited) {
          if (reachedGlobalLimit) {
            debug({
              text: `Stopping scrape - reached global limit of ${maxTotalMessages} messages`,
            });
          }
          if (rateLimited) {
            error({ text: "Stopping scrape - bot is rate limited" });
          }
          break;
        }

        currentChannel++;
        debug({
          text: `Processing channel ${currentChannel}/${channelArray.length}`,
        });
        debug({
          text: `Global progress: ${totalMessagesScraped}/${maxTotalMessages} messages scraped so far`,
        });
        debug({
          text: `Current batch: ${currentBatch.length}/${batchSize} messages`,
        });

        const result = await scrapeChannel(channelId);

        if (result.hitGlobalLimit) {
          debug({
            text: `Reached global message limit of ${maxTotalMessages}. Stopping scrape.`,
          });
          break;
        }

        if (result.rateLimited) {
          error({
            text: "Bot was rate limited. Stopping scrape to avoid further issues.",
          });
          rateLimited = true;
          break;
        }

        if (
          currentChannel < channelArray.length &&
          !reachedGlobalLimit &&
          !rateLimited
        ) {
          debug({ text: `Waiting ${waitFor}ms before next channel...` });
          await wait(waitFor);
        }
      } catch (channelProcessError: any) {
        error({ text: `Error processing channel ${channelId}:` });
        console.log(channelProcessError);

        if (
          channelProcessError.code === 50_013 ||
          channelProcessError.status === 429 ||
          channelProcessError.message.includes("rate limit")
        ) {
          error({
            text: "Rate limited at main loop level! Stopping all operations.",
          });
          rateLimited = true;
          break;
        }
      }
    }

    if (currentBatch.length > 0) {
      debug({
        text: `Saving final batch of ${currentBatch.length} messages...`,
      });
      await saveBatch();
    }

    console.log("\n=== SCRAPING COMPLETE ===");
    console.log(`Total channels processed: ${currentChannel}`);
    console.log(`Total messages scraped: ${totalMessagesScraped}`);
    console.log(`Total batches saved: ${totalBatchesSaved}`);
    console.log(`Global limit reached: ${reachedGlobalLimit ? "Yes" : "No"}`);
    console.log(`Rate limited: ${rateLimited ? "Yes" : "No"}`);
    console.log(
      `Time cutoff: ${cutoffDate.toISOString()} (${maxAgeWeeks} weeks ago)`
    );

    const result = {
      metadata: {
        totalMessages: totalMessagesScraped,
        totalBatchesSaved,
        channelsProcessed: currentChannel,
        totalChannels: channelArray.length,
        globalLimitReached: reachedGlobalLimit,
        rateLimited,
        timeLimitWeeks: maxAgeWeeks,
        cutoffDate: cutoffDate.toISOString(),
        scrapedAt: new Date().toISOString(),
        batchSize,
      },
      messages: [],
    };

    console.log(JSON.stringify(result, null, 2));

    debug({
      text: `Scraping server ended. Total messages: ${totalMessagesScraped}, Batches saved: ${totalBatchesSaved}, Rate limited: ${rateLimited}, Global limit reached: ${reachedGlobalLimit}`,
    });

    return result;
  } catch (err: any) {
    error({ text: "Something went wrong. Cancelling scrape procedure" });
    console.log(err);

    if (currentBatch && currentBatch.length > 0) {
      debug({
        text: `Emergency save: Attempting to save ${currentBatch.length} messages from current batch...`,
      });
      try {
        await saveBatch();
        debug({ text: "Emergency save successful!" });
      } catch (emergencyError) {
        error({ text: "Emergency save failed:" });
        console.log(emergencyError);
      }
    }

    return {
      error: true,
      message: err.message,
      scrapedAt: new Date().toISOString(),
      totalMessagesScraped,
      totalBatchesSaved,
    };
  } finally {
    switchScrapeStatus(guildID);
  }
}
