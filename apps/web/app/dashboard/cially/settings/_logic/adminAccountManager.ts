// biome-ignore lint/style/useFilenamingConvention: naming convention
"use server";

import { checkAdminPermissions } from "@/components/checkAdminPermissions";
import { cookies } from "next/headers";
import PocketBase from "pocketbase";

export async function fetchAdminAccounts() {
  try {
    const pbAdminAuth = await checkAdminPermissions();

    const url = process.env.POCKETBASE_URL;
    const pb = new PocketBase(url);

    pb.authStore.loadFromCookie(`pb_auth=${pbAdminAuth}`);

    const currentAdminId = pb.authStore.record?.id;

    await pb
      .collection("_superusers")
      .authWithPassword(
        String(process.env.POCKETBASE_ADMIN_EMAIL),
        String(process.env.POCKETBASE_ADMIN_PASSWORD),
      );

    const adminAccounts = await pb.collection("users").getFullList({
      filter: "admin = true",
    });

    const response = {
      currentAdminId,
      adminAccountsLength: adminAccounts.length,
      adminAccounts,
    };
    return response;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error
        ? err.message
        : "An error occurred while fetching admin accounts";
    return {
      error: true,
      message,
    };
  }
}

export async function deleteAdminAccount(accountId: string) {
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
    if (accountId === currentAdminId) {
      throw new Error("You cannot delete your own admin account");
    }

    await pb
      .collection("_superusers")
      .authWithPassword(
        String(process.env.POCKETBASE_ADMIN_EMAIL),
        String(process.env.POCKETBASE_ADMIN_PASSWORD),
      );

    const adminAccounts = await pb.collection("users").getFullList({
      filter: "admin = true",
    });

    if (adminAccounts.length < 2) {
      throw new Error("You cannot delete the only remaining admin account");
    }

    await pb.collection("users").delete(accountId);

    const response = {
      responseCode: 200,
      message: "Account deleted successfully",
    };

    return response;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error
        ? err.message
        : "An error occurred while deleting the account";
    return {
      responseCode: 500,
      message,
    };
  }
}

export async function createAdminAccount(
  name: string,
  email: string,
  password: string,
) {
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

    await pb
      .collection("_superusers")
      .authWithPassword(
        String(process.env.POCKETBASE_ADMIN_EMAIL),
        String(process.env.POCKETBASE_ADMIN_PASSWORD),
      );

    const existingAccounts = await pb.collection("users").getList(1, 1, {
      filter: `email="${email}"`,
    });

    if (existingAccounts.items.length > 0) {
      throw new Error("Admin account already exists");
    }

    const body = {
      email,
      emailVisibility: false,
      name,
      admin: true,
      password,
      passwordConfirm: password,
    };

    await pb.collection("users").create(body);

    const response = {
      responseCode: 200,
      message: "Admin account created successfully",
    };

    return response;
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error
        ? err.message
        : "An error occurred while creating the account";
    return {
      responseCode: 500,
      message,
    };
  }
}
