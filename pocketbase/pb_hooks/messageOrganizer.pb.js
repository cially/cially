cronAdd('itemsOrganizer', '*/1 * * * *', () => {
  // Messages Organizer
  try {
    const scrapedServers = $app.findRecordsByFilter(
      'guilds', // collection
      'beingScraped = true', // filter
      '-beingScraped', // sort
      1, // limit
      0, // offset
    ); // optional filter params

    if (scrapedServers.length < 1) {
      const records = $app.findRecordsByFilter(
        'messages', // collection
        "guildID != '' && messageCreation != ''", // filter
        '-messageCreation', // sort
        10000, // limit
        0, // offset
      ); // optional filter params

      if (records.length > 0) {
        for (const record of records) {
          const recordJSON = JSON.parse(JSON.stringify(record));
          const creationDate = String(recordJSON.messageCreation);
          const date = creationDate.slice(0, 10);
          const hour = creationDate.slice(11, 13);
          const guildID = recordJSON.guildID;
          const channelID = recordJSON.channelID;
          const authorID = recordJSON.author;
          const messageLength = recordJSON.messageLength;

          // Hourly Stats Format
          const timeRecords = $app.findRecordsByFilter(
            'hourly_stats', // collection
            `guildID = '${guildID}' && hour = '${hour}' && date = '${date}'`, // filter
            '-hour', // sort
            1, // limit
            0, // offset
          );

          if (timeRecords.length > 0) {
            const timeRecord = timeRecords[0];
            const timeRecordJSON = JSON.parse(JSON.stringify(timeRecord));

            timeRecord.set('messages', Number(timeRecordJSON.messages) + 1);
            $app.save(timeRecord);
          } else {
            const hour_collection =
              $app.findCollectionByNameOrId('hourly_stats');
            const newHourRecord = new Record(hour_collection);

            newHourRecord.set('guildID', guildID);
            newHourRecord.set('hour', hour);
            newHourRecord.set('date', date);
            newHourRecord.set('messages', 1);

            $app.save(newHourRecord);
          }

          // Author Stats Format
          const authorRecords = $app.findRecordsByFilter(
            'user_stats', // collection
            `guildID = '${guildID}' && authorID = '${authorID}'`, // filter
            '-authorID', // sort
            1, // limit
            0, // offset
          );

          if (authorRecords.length > 0) {
            const authorRecord = authorRecords[0];
            const authorRecordJSON = JSON.parse(JSON.stringify(authorRecord));

            authorRecord.set(
              'totalMessages',
              Number(authorRecordJSON.totalMessages) + 1,
            );
            authorRecord.set(
              'totalMessageLength',
              Number(authorRecordJSON.totalMessageLength) + messageLength,
            );
            $app.save(authorRecord);
          } else {
            const user_collection = $app.findCollectionByNameOrId('user_stats');
            const newAuthorRecord = new Record(user_collection);

            newAuthorRecord.set('authorID', authorID);
            newAuthorRecord.set('guildID', guildID);
            newAuthorRecord.set('totalMessages', 1);
            newAuthorRecord.set('totalMessageLength', messageLength);

            $app.save(newAuthorRecord);
          }

          // Channel Stats Format
          const channelRecords = $app.findRecordsByFilter(
            'channel_stats', // collection
            `guildID = '${guildID}' && channelID = '${channelID}'`, // filter
            '-channelID', // sort
            1, // limit
            0, // offset
          );

          if (channelRecords.length > 0) {
            const channelRecord = channelRecords[0];
            const channelRecordJSON = JSON.parse(JSON.stringify(channelRecord));

            channelRecord.set('amount', Number(channelRecordJSON.amount) + 1);
            $app.save(channelRecord);
          } else {
            const channel_collection =
              $app.findCollectionByNameOrId('channel_stats');
            const newChannelRecord = new Record(channel_collection);

            newChannelRecord.set('channelID', channelID);
            newChannelRecord.set('guildID', guildID);
            newChannelRecord.set('amount', 1);

            $app.save(newChannelRecord);
          }

          $app.delete(record);
          console.log(`Succesfully processed record: ${recordJSON.id}`);
        }
        console.log(`====== Job Finished ======`);
      }
    } else {
      console.log(
        'There is a scrape undergoing for a server. Cancelled organizing data...',
      );
      console.log(`====== Message Job Finished ======`);
    }
  } catch (err) {
    console.log('Error in message organizer:', err);
  }

  // Combined Members and Joins Organizer
  try {
    const records = $app.findRecordsByFilter(
      'member_joins', // collection
      "guildID != '' && memberID != '' && logged = false", // filter
      '-memberID', // sort
      1000, // limit
      0, // offset
    ); // optional filter params

    if (records.length > 0) {
      for (const record of records) {
        const recordJSON = JSON.parse(JSON.stringify(record));
        const creationDate = String(recordJSON.created);
        const date = creationDate.slice(0, 10);
        const hour = creationDate.slice(11, 13);
        const guildID = recordJSON.guildID;
        const isUnique = recordJSON.unique === true;

        // Find or create hourly stats record
        const timeRecords = $app.findRecordsByFilter(
          'hourly_stats', // collection
          `guildID = '${guildID}' && hour = '${hour}' && date = '${date}'`, // filter
          '-hour', // sort
          1, // limit
          0, // offset
        );

        let timeRecord;
        let timeRecordJSON;

        if (timeRecords.length > 0) {
          timeRecord = timeRecords[0];
          timeRecordJSON = JSON.parse(JSON.stringify(timeRecord));
        } else {
          // Create new hourly stats record
          const hour_collection = $app.findCollectionByNameOrId('hourly_stats');
          timeRecord = new Record(hour_collection);

          timeRecord.set('guildID', guildID);
          timeRecord.set('hour', hour);
          timeRecord.set('date', date);
          timeRecord.set('messages', 0);
          timeRecord.set('joins', 0);
          timeRecord.set('unique_users', 0);

          timeRecordJSON = {
            joins: 0,
            unique_users: 0,
          };
        }

        // Update joins count for all records
        timeRecord.set('joins', Number(timeRecordJSON.joins || 0) + 1);

        // Update unique users count only if this is a unique join
        if (isUnique) {
          timeRecord.set(
            'unique_users',
            Number(timeRecordJSON.unique_users || 0) + 1,
          );
        }

        $app.save(timeRecord);

        // Mark record as logged
        record.set('logged', true);
        $app.save(record);

        console.log(
          `Successfully processed join record: ${record.id} (unique: ${isUnique})`,
        );
      }
      console.log(`====== Combined Members and Joins Job Finished ======`);
    }
  } catch (err) {
    console.log('Error in joins organizer:', err);
  }

  // Leaves Organizer
  try {
    const records = $app.findRecordsByFilter(
      'member_leaves', // collection
      "guildID != '' && memberID != '' && logged = false", // filter
      '-memberID', // sort
      1000, // limit
      0, // offset
    ); // optional filter params

    if (records.length > 0) {
      for (const record of records) {
        const recordJSON = JSON.parse(JSON.stringify(record));
        const creationDate = String(recordJSON.created);
        const date = creationDate.slice(0, 10);
        const hour = creationDate.slice(11, 13);
        const guildID = recordJSON.guildID;

        // Hourly Stats Format
        const timeRecords = $app.findRecordsByFilter(
          'hourly_stats', // collection
          `guildID = '${guildID}' && hour = '${hour}' && date = '${date}'`, // filter
          '-hour', // sort
          1, // limit
          0, // offset
        );

        if (timeRecords.length > 0) {
          const timeRecord = timeRecords[0];
          const timeRecordJSON = JSON.parse(JSON.stringify(timeRecord));

          timeRecord.set('leaves', Number(timeRecordJSON.leaves) + 1);
          $app.save(timeRecord);
        } else {
          const hour_collection = $app.findCollectionByNameOrId('hourly_stats');
          const newHourRecord = new Record(hour_collection);

          newHourRecord.set('guildID', guildID);
          newHourRecord.set('hour', hour);
          newHourRecord.set('date', date);
          newHourRecord.set('messages', 0);
          newHourRecord.set('leaves', 1);

          $app.save(newHourRecord);
        }
        record.set('logged', true);
        $app.save(record);
        console.log(`Succesfully processed leave record: ${record.id}`);
      }
      console.log(`====== Leave Job Finished ======`);
    }
  } catch (err) {
    console.log('Error in leaves organizer:', err);
  }
});
