/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {

    try {


        const recordID = e.record.get('user_id')

        console.log("> The privacy settings command got triggered by ", recordID)

        function eraseData(userID, field_name, collection) {
            const records = $app.findRecordsByFilter(
                collection, // collection
                `${field_name} = "${userID}"` // filter
            );

            records.forEach((record) => {
                $app.delete(record);
                console.log("> Deleted a record for user_id: ", userID, " from collection: ", collection)
            })
        }

        eraseData(recordID, "authorID", "user_stats");
        eraseData(recordID, "memberID", "member_leaves");
        eraseData(recordID, "memberID", "member_joins");
        eraseData(recordID, "author", "messages");

        console.log("====== Job Finished ======")
        e.next();
    } catch (err) {
        console.log("Error in processUserPrivacyChanges:", err);
        e.next();
    }
}, "opted_out");
