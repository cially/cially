import { tool } from 'ai';
import { z } from 'zod';

export const getMessageData = tool({
  // TODO: Add a clear description for the AI to understand when to use this tool
  description: 'Fetches comprehensive message analytics for the Discord server. Includes total message counts, media attachments, message edits, and deletions. Provides historical trends across three timeframes: the last 24 hours (hourly), the last 7 days (daily), and the last 4 weeks (weekly). Use this tool to answer questions about user activity levels, engagement spikes, or content modification trends.',

  // TODO: Implement the execute function
  // This function runs when the AI calls the tool
  execute: async ({ serverID }) => {
    // Implementation goes here
    let request = await fetch('/api/server/asd/fetchMessageData')
    let data = await request.json()
    return data;
  },
});
