import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

export async function GET() {
  try {
    await pb
      .collection("_superusers")
      .authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL,
        process.env.POCKETBASE_ADMIN_PASSWORD,
      );

    const account = await pb
      .collection("users")
      .getFirstListItem(
        'id!="" && email="cially-guest@do-not-create-an-admin-account-with-this-address-manually.it-will-break-things.com"',
        {},
      );

    return Response.json({ account: account });
  } catch (error) {
    if (error.status === 404) {
      return Response.json({ noAccounts: true });
    }
    console.log(error);
    return Response.json({ error: 404 });
  }
}
