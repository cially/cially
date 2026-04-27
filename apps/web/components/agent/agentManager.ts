"use server"

import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

export async function createAgent(data: { provider: string; model: string; apiKey: string }): Promise<boolean> {
  try {
    await pb
      .collection("_superusers")
      .authWithPassword(
        String(process.env.POCKETBASE_ADMIN_EMAIL),
        String(process.env.POCKETBASE_ADMIN_PASSWORD)
      );

    await pb.collection('agents').create({
      provider: data.provider,
      model: data.model,
      API_KEY: data.apiKey,
    });

    return true;
  } catch (err) {
    console.error("Failed to create agent:", err);
    return false;
  }
}

export async function agentsExist(): Promise<boolean> {

  try {
    await pb
      .collection("_superusers")
      .authWithPassword(
        String(process.env.POCKETBASE_ADMIN_EMAIL),
        String(process.env.POCKETBASE_ADMIN_PASSWORD)
      );

    const agents = await pb.collection('agents').getList(1, 50, {
    });

    if (agents.totalItems > 0) {
      return true;
    }

    return false;

  } catch (err) {
    console.log(err)
    return false;
  }
}
