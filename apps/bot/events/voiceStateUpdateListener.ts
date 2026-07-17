import { Events, Guild, GuildMember, VoiceState } from "discord.js";
import { debug } from "../terminal/debug";
import { checkPrivacyPreferences } from "../http/API/functions/logic/checkPrivacyPreferences";
import { vcStateUpdate } from "../http/API/functions/voiceStateUpdate";

export const name = Events.VoiceStateUpdate;
export async function execute(oldState: VoiceState, newState: VoiceState) {

  // @ts-expect-error: oldState.member always returns GuildMember object even when oldState is null
  const user: GuildMember = newState.member || oldState.member;
  if (!user) return;

  // Check if author is opted out early to save resources
  const isUserOptedOut = await checkPrivacyPreferences(user.id);
  if (isUserOptedOut) {
    debug({ text: `User ${user.displayName} (${user.id}) is opted out. Not processing VC event.` });
    return;
  }

  const oldChannelID = oldState.channelId;
  const newChannelID = newState.channelId;

  const guildID = newState.guild.id

  // User Joins VC
  if (!oldChannelID && newChannelID) {
    await vcStateUpdate(guildID, user.id, newChannelID, "join")
  }

  // User Leaves VC
  else if (oldChannelID && !newChannelID) {
    await vcStateUpdate(guildID, user.id, oldChannelID, "leave")
  }

  // User Switches VC
  else if (oldChannelID && newChannelID) {
    await vcStateUpdate(guildID, user.id, newChannelID, "join")
    await vcStateUpdate(guildID, user.id, oldChannelID, "leave")
  }

}
