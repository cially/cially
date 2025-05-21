import PocketBase from "pocketbase";

// Pocketbase Initialization
const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

// Main GET Event
export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	async function deleteAllFromCollection(collectionName: string) {
		const records = await pb.collection(collectionName).getFullList(); // loads all records
		await Promise.all(
			records.map((record) => pb.collection(collectionName).delete(record.id)),
		);
	}

	try {
		// Deletes data in the "guilds" collection so all the data loses their guild relation
		// Saves time & data instead of clearing every single collection
		await deleteAllFromCollection("guilds");
		return Response.json({ code: "Success" });
	} catch (err) {
		return Response.json({ code: "Error" });
	}
}
