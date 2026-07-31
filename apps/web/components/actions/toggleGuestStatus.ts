"use server";

import PocketBase from "pocketbase";
import { checkAdminPermissions } from "@/components/checkAdminPermissions";

const url = process.env.POCKETBASE_URL;

export async function toggleGuestStatusAction() {
  await checkAdminPermissions();

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
      .getFirstListItem(
        'id!="" && email="cially-guest@do-not-create-an-admin-account-with-this-address-manually.it-will-break-things.com"',
        {}
      );

    await pb.collection("users").delete(account.id);

    return { new_status: "private" };
  } catch (error: any) {
    if (error.status === 404) {
      const data = {
        email:
          "cially-guest@do-not-create-an-admin-account-with-this-address-manually.it-will-break-things.com",
        emailVisibility: true,
        name: "Guest Account",
        admin: false,
        password: "do-not-create-an-admin-account-with-this-address",
        passwordConfirm: "do-not-create-an-admin-account-with-this-address",
      };

      await pb.collection("users").create(data);
      return { new_status: "public" };
    }
    console.log(error);
    return { error: 404 };
  }
}
