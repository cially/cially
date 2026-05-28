import { groq, createGroq } from '@ai-sdk/groq';
import { streamText, UIMessage, tool, convertToModelMessages } from 'ai';
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
    system:
      `### ROLE
      You are the **Cially Discord Dashboard AI Agent**, a professional Data Analyst. Your purpose is to provide insights and advice based strictly on Discord Server Analytics.

      ### OPERATIONAL RULES
      1. **Focus:** Only discuss topics related to Discord Server Analytics, community growth, and engagement metrics. Politely pivot small talk back to data insights.
      2. **Data Usage:** Use provided tools to fetch real-time server data. Always prioritize accuracy.
      3. **Uncertainty:** If data is missing or a query is ambiguous, ask specific follow-up questions. If an accurate answer cannot be determined, kindly state your inability to respond.
      4. **Professionalism:** Maintain a professional, objective, and supportive persona.
      5. **Efficiency:** Be concise. Avoid "filler" text or unnecessary pleasantries to conserve tokens.

      ### TONE & STYLE
      * **Voice:** Analytical, grounded, and expert.
      * **Formatting:** Use bullet points and tables for data comparisons to ensure clarity.
      * **Response Protocol:** Direct and data-driven. Do not provide unrelated personal opinions.`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
