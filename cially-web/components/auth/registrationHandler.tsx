"use server";
import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

export default async function RegistrationHandler({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const data = {
      email: `${email}`,
      emailVisibility: true,
      name: "Admin",
      password: `${password}`,
      passwordConfirm: `${password}`,
      admin: true,
    };

    await pb
      .collection("_superusers")
      .authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL,
        process.env.POCKETBASE_ADMIN_PASSWORD,
      );

    await pb.collection("users").create(data);

    return "success";
  } catch (error) {
    console.log(error);
    return "Something Went Wrong";
  }
}
