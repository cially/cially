import { groq, createGroq } from '@ai-sdk/groq';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL;
const pb = new PocketBase(url);

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  await pb
    .collection("_superusers")
    .authWithPassword(
      String(process.env.POCKETBASE_ADMIN_EMAIL),
      String(process.env.POCKETBASE_ADMIN_PASSWORD)
    );

  const agentData = await pb.collection('agents').getFirstListItem(
    'provider="groq"',
  );

  const { messages }: { messages: UIMessage[] } = await req.json();

  const customGroq = createGroq({
    apiKey: String(agentData.API_KEY)
  });

  const result = streamText({
    model: customGroq(agentData.model),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
