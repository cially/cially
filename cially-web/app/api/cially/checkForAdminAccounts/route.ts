import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

export async function GET() {
	try {
		const account = await pb
			.collection("users")
			.getFirstListItem('id!=""', {
			});


		return Response.json({ account: account });
	} catch (error) {
		if (error.status === 404) {
			return Response.json({ noAccounts: true });
		}
		console.log(error);
		return Response.json({ error: 404 });
	}
}
