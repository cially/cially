"use server";

import PocketBase from "pocketbase";
import { cookies } from "next/headers";

const url = process.env.POCKETBASE_URL;

export async function checkForGuestAccountAction() {
  const pb = new PocketBase(url);
  try {
    const cookieStore = await cookies();
    const isUserAGuest = cookieStore.get("guest");

    console.log(isUserAGuest);

    await pb
      .collection("_superusers")
      .authWithPassword(
        String(process.env.POCKETBASE_ADMIN_EMAIL),
        String(process.env.POCKETBASE_ADMIN_PASSWORD),
      );

    const account = await pb
      .collection("users")
      .getFirstListItem(
        'id!="" && email="cially-guest@do-not-create-an-admin-account-with-this-address-manually.it-will-break-things.com"',
        {},
      );

    return { account: account.name };
  } catch (error: any) {
    if (error.status === 404) {
      return { noAccounts: true };
    }
    console.log(error);
    return { error: 404 };
  }
}
