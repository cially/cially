import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

export async function GET() {
  try {
    await pb
      .collection("_superusers")
      .authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL,
        process.env.POCKETBASE_ADMIN_PASSWORD
      );

    // Checks if an admin account exists
    const account = await pb
      .collection("users")
      .getFirstListItem('id!="" && admin=true', {});

    return Response.json({ adminAccountExists: true, responseCode: 200 });
  } catch (error) {
    if (error.status === 404) {
      return Response.json({ adminAccountExists: false, responseCode: 200 });
    }
    console.log(error);
    return Response.json({ adminAccountExists: null, responseCode: 404 });
  }
}
