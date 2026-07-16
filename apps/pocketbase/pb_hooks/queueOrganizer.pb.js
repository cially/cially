cronAdd("queueOrganizer", "*/1 * * * *", () => {
  // Messages Organizer
  try {
    const scrapedServers = $app.findRecordsByFilter(
      "guilds", // collection
      "beingScraped = true", // filter
      "-beingScraped", // sort
      1, // limit
      0 // offset
    ); // optional filter params

    if (scrapedServers.length < 1) {
      const records = $app.findRecordsByFilter(
        "messages", // collection
        "guildID != '' && messageCreation != ''", // filter
        "-messageCreation", // sort
        10_000, // limit
        0 // offset
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
            "hourly_stats", // collection
            `guildID = '${guildID}' && hour = '${hour}' && date = '${date}'`, // filter
            "-hour", // sort
            1, // limit
            0 // offset
          );

          if (timeRecords.length > 0) {
            const timeRecord = timeRecords[0];
            const timeRecordJSON = JSON.parse(JSON.stringify(timeRecord));

            timeRecord.set("messages", Number(timeRecordJSON.messages) + 1);
            $app.save(timeRecord);
          } else {
            const hour_collection =
              $app.findCollectionByNameOrId("hourly_stats");
            const newHourRecord = new Record(hour_collection);

            newHourRecord.set("guildID", guildID);
            newHourRecord.set("hour", hour);
            newHourRecord.set("date", date);
            newHourRecord.set("messages", 1);

            $app.save(newHourRecord);
          }

          // Author Stats Format
          const authorRecords = $app.findRecordsByFilter(
            "user_stats", // collection
            `guildID = '${guildID}' && authorID = '${authorID}'`, // filter
            "-authorID", // sort
            1, // limit
            0 // offset
          );

          if (authorRecords.length > 0) {
            const authorRecord = authorRecords[0];
            const authorRecordJSON = JSON.parse(JSON.stringify(authorRecord));

            authorRecord.set(
              "totalMessages",
              Number(authorRecordJSON.totalMessages) + 1
            );
            authorRecord.set(
              "totalMessageLength",
              Number(authorRecordJSON.totalMessageLength) + messageLength
            );
            $app.save(authorRecord);
          } else {
            const user_collection = $app.findCollectionByNameOrId("user_stats");
            const newAuthorRecord = new Record(user_collection);

            newAuthorRecord.set("authorID", authorID);
            newAuthorRecord.set("guildID", guildID);
            newAuthorRecord.set("totalMessages", 1);
            newAuthorRecord.set("totalMessageLength", messageLength);

            $app.save(newAuthorRecord);
          }

          // Channel Stats Format
          const channelRecords = $app.findRecordsByFilter(
            "channel_stats", // collection
            `guildID = '${guildID}' && channelID = '${channelID}'`, // filter
            "-channelID", // sort
            1, // limit
            0 // offset
          );

          if (channelRecords.length > 0) {
            const channelRecord = channelRecords[0];
            const channelRecordJSON = JSON.parse(JSON.stringify(channelRecord));

            channelRecord.set("amount", Number(channelRecordJSON.amount) + 1);
            $app.save(channelRecord);
          } else {
            const channel_collection =
              $app.findCollectionByNameOrId("channel_stats");
            const newChannelRecord = new Record(channel_collection);

            newChannelRecord.set("channelID", channelID);
            newChannelRecord.set("guildID", guildID);
            newChannelRecord.set("amount", 1);

            $app.save(newChannelRecord);
          }

          $app.delete(record);
          console.log(`Succesfully processed record: ${recordJSON.id}`);
        }
        console.log("====== Job Finished ======");
      }
    } else {
      console.log(
        "There is a scrape undergoing for a server. Cancelled organizing data..."
      );
      console.log("====== Message Job Finished ======");
    }
  } catch (err) {
    console.log("Error in message organizer:", err);
  }

  // Combined Members and Joins Organizer
  try {
    const records = $app.findRecordsByFilter(
      "member_joins", // collection
      "guildID != '' && memberID != '' && logged = false", // filter
      "-memberID", // sort
      1000, // limit
      0 // offset
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
          "hourly_stats", // collection
          `guildID = '${guildID}' && hour = '${hour}' && date = '${date}'`, // filter
          "-hour", // sort
          1, // limit
          0 // offset
        );

        let timeRecord;
        let timeRecordJSON;

        if (timeRecords.length > 0) {
          timeRecord = timeRecords[0];
          timeRecordJSON = JSON.parse(JSON.stringify(timeRecord));
        } else {
          // Create new hourly stats record
          const hour_collection = $app.findCollectionByNameOrId("hourly_stats");
          timeRecord = new Record(hour_collection);

          timeRecord.set("guildID", guildID);
          timeRecord.set("hour", hour);
          timeRecord.set("date", date);
          timeRecord.set("messages", 0);
          timeRecord.set("joins", 0);
          timeRecord.set("unique_users", 0);

          timeRecordJSON = {
            joins: 0,
            unique_users: 0,
          };
        }

        // Update joins count for all records
        timeRecord.set("joins", Number(timeRecordJSON.joins || 0) + 1);

        // Update unique users count only if this is a unique join
        if (isUnique) {
          timeRecord.set(
            "unique_users",
            Number(timeRecordJSON.unique_users || 0) + 1
          );
        }

        $app.save(timeRecord);

        // Mark record as logged
        record.set("logged", true);
        $app.save(record);

        console.log(
          `Successfully processed join record: ${record.id} (unique: ${isUnique})`
        );
      }
      console.log("====== Combined Members and Joins Job Finished ======");
    }
  } catch (err) {
    console.log("Error in joins organizer:", err);
  }

  // Leaves Organizer
  try {
    const records = $app.findRecordsByFilter(
      "member_leaves", // collection
      "guildID != '' && memberID != '' && logged = false", // filter
      "-memberID", // sort
      1000, // limit
      0 // offset
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
          "hourly_stats", // collection
          `guildID = '${guildID}' && hour = '${hour}' && date = '${date}'`, // filter
          "-hour", // sort
          1, // limit
          0 // offset
        );

        if (timeRecords.length > 0) {
          const timeRecord = timeRecords[0];
          const timeRecordJSON = JSON.parse(JSON.stringify(timeRecord));

          timeRecord.set("leaves", Number(timeRecordJSON.leaves) + 1);
          $app.save(timeRecord);
        } else {
          const hour_collection = $app.findCollectionByNameOrId("hourly_stats");
          const newHourRecord = new Record(hour_collection);

          newHourRecord.set("guildID", guildID);
          newHourRecord.set("hour", hour);
          newHourRecord.set("date", date);
          newHourRecord.set("messages", 0);
          newHourRecord.set("leaves", 1);

          $app.save(newHourRecord);
        }
        record.set("logged", true);
        $app.save(record);
        console.log(`Succesfully processed leave record: ${record.id}`);
      }
      console.log("====== Leave Job Finished ======");
    }
  } catch (err) {
    console.log("Error in leaves organizer:", err);
  }

  // Voice Channel Organizer
  try {
    const vcLeaveRecords = $app.findRecordsByFilter(
      "voice_channel_data_queue",
      "action = 'leave'",
      "-event_creation",
      10000,
      0,
    );

    vcLeaveRecords.forEach((leaveRecord) => {
      const user_id = leaveRecord.get("user_id");
      const channel_id = leaveRecord.get("channel_id");
      const guild = leaveRecord.get("guild");
      const leave_event_date = leaveRecord.get("event_creation");

      try {
        let joinRecord = $app.findRecordsByFilter(
          "voice_channel_data_queue",
          `user_id = '${user_id}' && channel_id = '${channel_id}' && guild = '${guild}' && action = 'join'  && event_creation < '${leave_event_date}'`,
          "-event_creation",
          1,
          0
        );

        if (joinRecord.length < 1) {
          throw new Error("No join records found.")
        }

        joinRecord = joinRecord[0]

        const join_event_date = joinRecord.get("event_creation")

        console.log(`[VC Processing]: User ${user_id} joined channel ${channel_id} at: ${join_event_date} and left at: ${leave_event_date}`)


        const leave_event_date_ms = new Date(leave_event_date).getTime();
        const join_event_date_ms = new Date(join_event_date).getTime();
        const time_difference_in_secs = Math.round((leave_event_date_ms - join_event_date_ms) / 1000)

        console.log(`That's ${time_difference_in_secs} seconds`)

        // Process user stats
        let userRecord = $app.findRecordsByFilter(
          "user_stats",
          `guildID = '${guild}' && authorID = '${user_id}'`,
          "-authorID",
          1,
          0
        );

        if (userRecord.length > 0) {
          userRecord = userRecord[0]

          const currentVCTime = userRecord.get('vc_time')

          userRecord.set("vc_time", Number(currentVCTime + time_difference_in_secs))
          $app.save(userRecord);

        } else {
          let collection = $app.findCollectionByNameOrId("user_stats")
          let new_user_record = new Record(collection)

          new_user_record.set("authorID", user_id)
          new_user_record.set("guildID", guild)
          new_user_record.set("vc_time", Number(time_difference_in_secs))
          $app.save(new_user_record);
        }

        // Process Hourly Stats
        const joinDate = String(join_event_date).slice(0, 10);
        const joinHour = String(join_event_date).slice(11, 13);

        const leaveDate = String(leave_event_date).slice(0, 10);
        const leaveHour = String(leave_event_date).slice(11, 13);

        // Join Records Process
        let timeRecords = $app.findRecordsByFilter(
          "hourly_stats", // collection
          `guildID = '${guild}' && hour = '${joinHour}' && date = '${joinDate}'`, // filter
          "-hour", // sort
          1, // limit
          0 // offset
        );

        if (timeRecords.length > 0) {
          const timeRecord = timeRecords[0];
          const timeRecordJSON = JSON.parse(JSON.stringify(timeRecord));

          timeRecord.set("vc_joins", Number(timeRecordJSON.vc_joins) + 1);
          $app.save(timeRecord);
        } else {
          const hour_collection =
            $app.findCollectionByNameOrId("hourly_stats");
          const newHourRecord = new Record(hour_collection);

          newHourRecord.set("guildID", guild);
          newHourRecord.set("hour", joinHour);
          newHourRecord.set("date", joinDate);
          newHourRecord.set("vc_joins", 1);

          $app.save(newHourRecord);
        }

        // Leave Records Process
        timeRecords = $app.findRecordsByFilter(
          "hourly_stats", // collection
          `guildID = '${guild}' && hour = '${leaveHour}' && date = '${leaveDate}'`, // filter
          "-hour", // sort
          1, // limit
          0 // offset
        );

        if (timeRecords.length > 0) {
          const timeRecord = timeRecords[0];
          const timeRecordJSON = JSON.parse(JSON.stringify(timeRecord));

          timeRecord.set("vc_leaves", Number(timeRecordJSON.vc_leaves) + 1);
          $app.save(timeRecord);
        } else {
          const hour_collection =
            $app.findCollectionByNameOrId("hourly_stats");
          const newHourRecord = new Record(hour_collection);

          newHourRecord.set("guildID", guild);
          newHourRecord.set("hour", leaveHour);
          newHourRecord.set("date", leaveDate);
          newHourRecord.set("vc_leaves", 1);

          $app.save(newHourRecord);
        }

        // Voice Channel Stats Format
        const vcRecords = $app.findRecordsByFilter(
          "voice_channels_stats", // collection
          `guildID = '${guild}' && channelID = '${channel_id}'`, // filter
          "-channelID", // sort
          1, // limit
          0 // offset
        );

        if (vcRecords.length > 0) {
          const vcRecord = vcRecords[0];
          const vcRecordJSON = JSON.parse(JSON.stringify(vcRecord));

          vcRecord.set("total_vc_time", Number(vcRecordJSON.total_vc_time) + time_difference_in_secs);
          $app.save(vcRecord);
        } else {
          const vc_channels_collection =
            $app.findCollectionByNameOrId("voice_channels_stats");
          const newChannelRecord = new Record(vc_channels_collection);

          newChannelRecord.set("channelID", channel_id);
          newChannelRecord.set("guildID", guild);
          newChannelRecord.set("total_vc_time", time_difference_in_secs);

          $app.save(newChannelRecord);
        }

        $app.delete(leaveRecord)
        $app.delete(joinRecord)

        console.log(`Processed VC Records: ${leaveRecord.id} & ${joinRecord.id}`)


      } catch (err) {
        $app.delete(leaveRecord)
        console.log(
          `Could not find a join record for the leave record with id: ${leaveRecord.id}. Deleting record...`,
        );
        console.log(err)
      }
    });
  } catch (err) {
    console.log(err);
  }


});
