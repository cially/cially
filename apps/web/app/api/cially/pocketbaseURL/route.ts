const url = process.env.POCKETBASE_URL;

export async function GET() {
  try {
    return Response.json({ url: url });
  } catch (error) {
    console.log(error);
    return Response.json({ error: 404 });
  }
}
