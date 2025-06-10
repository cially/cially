export async function GET() {
	try {
		const API_REQ = await fetch(
			`${process.env.NEXT_PUBLIC_BOT_API_URL}/fetchGuilds`,
		);
		const data = await API_REQ.json();
		return Response.json({ data });
	} catch (err) {
		console.log("An error occured while trying to fetch data");
		console.log(err);
	}
}
