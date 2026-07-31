"use server";

import { cookies } from "next/headers";
import PocketBase from "pocketbase";

export async function checkAdminPermissions() {
  try {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get("pb_auth");

    if (!pbAuth) {
      throw new Error("You need to be authenticated to perform this action");
    }

    const url = process.env.POCKETBASE_URL;
    const pb = new PocketBase(url);

    pb.authStore.loadFromCookie(`pb_auth=${pbAuth.value}`);

    await pb.collection("users").authRefresh();

    if (!pb.authStore.record?.admin) {
      throw new Error("You need to be an admin to perform this action");
    }

    const currentAdminId = pb.authStore.record?.id;
    return pbAuth.value;
  } catch (error) {
    throw error;
  }
}
