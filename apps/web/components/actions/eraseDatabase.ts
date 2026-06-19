"use server";

import PocketBase from "pocketbase";
import { checkAdminPermissions } from "@/components/checkAdminPermissions";

const url = process.env.POCKETBASE_URL;

export async function eraseDatabaseAction() {
  await checkAdminPermissions();
  
  const pb = new PocketBase(url);
  async function deleteAllFromCollection(collectionName: string) {
    await pb
      .collection("_superusers")
      .authWithPassword(
        String(process.env.POCKETBASE_ADMIN_EMAIL),
        String(process.env.POCKETBASE_ADMIN_PASSWORD)
      );

    const records = await pb.collection(collectionName).getFullList();
    await Promise.all(
      records.map((record) => pb.collection(collectionName).delete(record.id))
    );
  }

  try {
    await deleteAllFromCollection("guilds");
    return { code: "Success" };
  } catch (_err) {
    return { code: "Error" };
  }
}
