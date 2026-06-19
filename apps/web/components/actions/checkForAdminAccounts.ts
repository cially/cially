"use server";

import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;

export async function checkForAdminAccountsAction() {
  const pb = new PocketBase(url);
  try {
    await pb
      .collection("_superusers")
      .authWithPassword(
        String(process.env.POCKETBASE_ADMIN_EMAIL),
        String(process.env.POCKETBASE_ADMIN_PASSWORD)
      );

    const account = await pb
      .collection("users")
      .getFirstListItem('id!="" && admin=true', {});

    return { adminAccountExists: true, responseCode: 200 };
  } catch (error: any) {
    if (error.status === 404) {
      return { adminAccountExists: false, responseCode: 200 };
    }
    console.log(error);
    return { adminAccountExists: null, responseCode: 404 };
  }
}
