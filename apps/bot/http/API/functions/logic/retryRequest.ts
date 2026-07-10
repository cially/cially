import { debug } from "../../../../terminal/debug";

export async function retryRequest<T>(
  fn: () => Promise<T>,
  retries = 25,
  baseDelay = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err: any) {
      if (err.status === 429) {
        const retryAfter = err.response?.headers?.["retry-after"];
        const delay = retryAfter
          ? Number.parseInt(retryAfter) * 1000
          : baseDelay * (attempt + 1);
        debug({
          text: `Retrying to communicate with the database in ${delay / 1000}s`,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt++;
      } else {
        debug({ text: `API Timeout after ${attempt} retries` });
        throw err;
      }
    }
  }
  throw new Error("Max retries exceeded.");
}
