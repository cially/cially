const { debug } = require("../../../../terminal/debug");
const { error } = require("../../../../terminal/error");

const PocketBase = require("pocketbase/cjs");
const url = process.env.POCKETBASE_URL;

async function checkPrivacyPreferences(userID) {
    const pb = new PocketBase(url);
    await pb.collection('_superusers').authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD);
    let isUserOptedOut

    try {
        const userRecord = await pb.collection('opted_out').getFirstListItem(`user_id="${userID}"`);
        isUserOptedOut = true
    } catch (err) {
        if (err.status === 404) {
            isUserOptedOut = false;
        } else {
            error({ text: `Failed to fetch user privacy status: \n${err}` });
        }
    }

    return isUserOptedOut;
}


module.exports = { checkPrivacyPreferences }