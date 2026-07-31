import { debug } from "../../../../terminal/debug";
import { error } from "../../../../terminal/error";
import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;

export async function checkPrivacyPreferences(userID: string): Promise<boolean> {
  const pb = new PocketBase(url);
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);
  }
  let isUserOptedOut = false;

  try {
    await pb.collection('opted_out').getFirstListItem(`user_id="${userID}"`);
    isUserOptedOut = true;
  } catch (err: any) {
    if (err.status === 404) {
      isUserOptedOut = false;
    } else {
      error({ text: `Failed to fetch user privacy status: \n${err}` });
    }
  }

  return isUserOptedOut;
}
