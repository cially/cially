const { debug } = require("../../../../../terminal/debug");
const { error } = require("../../../../../terminal/error");

async function discordScrape({ client, guildID }) {
  try {
    const discordGuild = await client.guilds.fetch(guildID);
    let channels = await discordGuild.channels.fetch();
    channels = Array.from(channels.values());
    const channelArray = [];

    for (const channel of channels) {
      if (channel.type === 0) {
        // GUILD_TEXT channel type
        channelArray.push(channel.id);
      } else {
        console.log(
          `Ignoring ${channel.id} (${channel.name}) - type: ${channel.type}`
        );
      }
    }

    // Scrape Options and Limits
    const maxTotalMessages = 50000;
    const maxAgeWeeks = 4;
    const waitFor = 1069;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeWeeks * 7);
    const cutoffTimestamp = cutoffDate.getTime();

    let currentChannel = 0;
    let totalMessagesScraped = 0;
    let allMessages = [];
    let reachedGlobalLimit = false;
    let rateLimited = false;

    debug({ text: "Scraping server started" });
    console.log(
      `Found ${channelArray.length} text channels to scrape:`,
      channelArray
    );

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // convert timestamp to PocketBase format (ISO 8601)
    const toPocketBaseDate = (timestamp) => {
        const date = new Date(timestamp);

        const pad = (num, size = 2) => String(num).padStart(size, "0");

        const year = date.getUTCFullYear();
        const month = pad(date.getUTCMonth() + 1);
        const day = pad(date.getUTCDate());
        const hours = pad(date.getUTCHours());
        const minutes = pad(date.getUTCMinutes());
        const seconds = pad(date.getUTCSeconds());
        const milliseconds = pad(date.getUTCMilliseconds(), 3);

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}Z`;
    };

    async function scrapeChannel(channelId) {
      try {
        if (rateLimited) {
          console.log(`Skipping channel ${channelId} - bot is rate limited`);
          return {
            messages: [],
            hitTimeLimit: false,
            hitGlobalLimit: false,
            rateLimited: true,
          };
        }

        const channel = await client.channels.fetch(channelId);
        if (!channel || channel.type !== 0) {
          console.log(`Skipping channel ${channelId} - not a text channel`);
          return {
            messages: [],
            hitTimeLimit: false,
            hitGlobalLimit: false,
            rateLimited: false,
          };
        }

        console.log(`Scraping channel: ${channel.name} (${channelId})`);

        let messages = [];
        let lastMessageId = null;
        let hasMoreMessages = true;
        let hitTimeLimit = false;
        let hitGlobalLimit = false;

        while (hasMoreMessages && !rateLimited) {
          if (totalMessagesScraped >= maxTotalMessages) {
            console.log(`Reached global message limit of ${maxTotalMessages}`);
            hitGlobalLimit = true;
            reachedGlobalLimit = true;
            break;
          }

          const remainingGlobalMessages =
            maxTotalMessages - totalMessagesScraped;
          const batchSize = Math.min(100, remainingGlobalMessages);

          const options = { limit: batchSize };

          if (lastMessageId) {
            options.before = lastMessageId;
          }

          try {
            const fetchedMessages = await channel.messages.fetch(options);

            if (fetchedMessages.size === 0) {
              hasMoreMessages = false;
              break;
            }

            const messageArray = Array.from(fetchedMessages.values());
            let validMessagesInBatch = 0;

            for (const message of messageArray) {
              if (message.author.bot) {
                continue;
              }

              if (message.createdTimestamp < cutoffTimestamp) {
                console.log(
                  `Hit time limit (4 weeks) in channel ${channel.name}`
                );
                hitTimeLimit = true;
                hasMoreMessages = false;
                break;
              }

              if (totalMessagesScraped >= maxTotalMessages) {
                console.log(
                  `Reached global message limit of ${maxTotalMessages}`
                );
                hitGlobalLimit = true;
                reachedGlobalLimit = true;
                hasMoreMessages = false;
                break;
              }

              const messageData = {
                messageID: message.id,
                author: message.author.id,
                guildID: guildID,
                messageLength: message.content
                  .trim()
                  .split(/\s+/)
                  .filter((word) => word.length > 0).length,
                channelID: message.channelId,
                created: toPocketBaseDate(message.createdTimestamp),
              };

              messages.push(messageData);
              totalMessagesScraped++;
              validMessagesInBatch++;
            }

            lastMessageId = messageArray[messageArray.length - 1]?.id;

            if (
              hasMoreMessages &&
              fetchedMessages.size === batchSize &&
              !rateLimited
            ) {
              console.log(
                `Waiting ${waitFor}ms before next batch... (${messages.length} messages scraped from ${channel.name} so far)`
              );
              await wait(waitFor);
            }

            if (validMessagesInBatch === 0 && hitTimeLimit) {
              break;
            }
          } catch (fetchError) {
            if (
              fetchError.code === 50013 ||
              fetchError.status === 429 ||
              fetchError.message.includes("rate limit")
            ) {
              console.log(
                `Rate limited detected! Stopping all scraping operations.`
              );
              console.log(`Error details:`, fetchError.message);
              rateLimited = true;
              break;
            } else {
              console.error(
                `Error fetching messages from ${channel.name}:`,
                fetchError.message
              );
              break;
            }
          }
        }

        const statusText = hitTimeLimit
          ? " (hit 4-week limit)"
          : hitGlobalLimit
          ? " (hit global limit)"
          : rateLimited
          ? " (rate limited)"
          : "";
        console.log(
          `Scraped ${messages.length} messages from ${channel.name}${statusText}`
        );

        return {
          messages,
          hitTimeLimit,
          hitGlobalLimit,
          rateLimited,
        };
      } catch (error) {
        if (
          error.code === 50013 ||
          error.status === 429 ||
          error.message.includes("rate limit")
        ) {
          console.log(
            `Rate limited when accessing channel ${channelId}! Stopping all operations.`
          );
          rateLimited = true;
          return {
            messages: [],
            hitTimeLimit: false,
            hitGlobalLimit: false,
            rateLimited: true,
          };
        } else {
          console.error(`Error scraping channel ${channelId}:`, error);
          return {
            messages: [],
            hitTimeLimit: false,
            hitGlobalLimit: false,
            rateLimited: false,
          };
        }
      }
    }

    for (const channelId of channelArray) {
      try {
        if (reachedGlobalLimit || rateLimited) {
          if (reachedGlobalLimit) {
            console.log(
              `Stopping scrape - reached global limit of ${maxTotalMessages} messages`
            );
          }
          if (rateLimited) {
            console.log(`Stopping scrape - bot is rate limited`);
          }
          break;
        }

        currentChannel++;
        console.log(
          `\n--- Processing channel ${currentChannel}/${channelArray.length} ---`
        );
        console.log(
          `Global progress: ${totalMessagesScraped}/${maxTotalMessages} messages scraped so far`
        );

        const result = await scrapeChannel(channelId);
        allMessages.push(...result.messages);

        if (result.hitGlobalLimit) {
          console.log(
            `Reached global message limit of ${maxTotalMessages}. Stopping scrape.`
          );
          break;
        }

        if (result.rateLimited) {
          console.log(
            `Bot was rate limited. Stopping scrape to avoid further issues.`
          );
          rateLimited = true;
          break;
        }

        if (
          currentChannel < channelArray.length &&
          !reachedGlobalLimit &&
          !rateLimited
        ) {
          console.log(`Waiting ${waitFor}ms before next channel...`);
          await wait(waitFor);
        }
      } catch (error) {
        console.error(`Error processing channel ${channelId}:`, error);

        if (
          error.code === 50013 ||
          error.status === 429 ||
          error.message.includes("rate limit")
        ) {
          console.log(
            `Rate limited at main loop level! Stopping all operations.`
          );
          rateLimited = true;
          break;
        }

        continue;
      }
    }

    console.log(`\n=== SCRAPING COMPLETE ===`);
    console.log(`Total channels processed: ${currentChannel}`);
    console.log(`Total messages scraped: ${totalMessagesScraped}`);
    console.log(`Global limit reached: ${reachedGlobalLimit ? "Yes" : "No"}`);
    console.log(`Rate limited: ${rateLimited ? "Yes" : "No"}`);
    console.log(
      `Time cutoff: ${cutoffDate.toISOString()} (${maxAgeWeeks} weeks ago)`
    );

    const messagesByChannel = {};

    allMessages.forEach((msg) => {
      const channelId = msg.channelID;
      if (!messagesByChannel[channelId]) {
        messagesByChannel[channelId] = 0;
      }
      messagesByChannel[channelId]++;
    });

    console.log("\n=== CHANNEL BREAKDOWN ===");
    Object.entries(messagesByChannel).forEach(([channelId, count]) => {
      console.log(`${channelId}: ${count} messages`);
    });

    if (allMessages.length > 0) {
      const allDates = allMessages.map((msg) =>
        new Date(msg.creationDate).getTime()
      );
      const oldestTimestamp = Math.min(...allDates);
      const newestTimestamp = Math.max(...allDates);
      const daySpan = Math.ceil(
        (newestTimestamp - oldestTimestamp) / (1000 * 60 * 60 * 24)
      );
    }

    const result = {
      metadata: {
        totalMessages: totalMessagesScraped,
        channelsProcessed: currentChannel,
        totalChannels: channelArray.length,
        globalLimitReached: reachedGlobalLimit,
        rateLimited: rateLimited,
        timeLimitWeeks: maxAgeWeeks,
        cutoffDate: cutoffDate.toISOString(),
        scrapedAt: new Date().toISOString(),
      },
      messages: allMessages,
    };

    console.log("\n=== JSON OUTPUT ===");
    console.log(JSON.stringify(result, null, 2));

    debug({
      text: `Scraping server ended. Total messages: ${totalMessagesScraped}, Rate limited: ${rateLimited}, Global limit reached: ${reachedGlobalLimit}`,
    });

    return result;
  } catch (err) {
    console.log("Something went wrong. Cancelling scrape procedure");
    console.log(err);

    return {
      error: true,
      message: err.message,
      scrapedAt: new Date().toISOString(),
    };
  }
}

module.exports = { discordScrape };
