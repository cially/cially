import { Events, GuildMember } from "discord.js";
import { debug } from "../terminal/debug";
import { checkPrivacyPreferences } from "../http/API/functions/logic/checkPrivacyPreferences";
import { guildMemberRemove } from "../http/API/functions/guildMemberRemove";

export const name = Events.GuildMemberRemove;
export async function execute(member: GuildMember) {
  // Check if author is opted out early to save resources
  const isUserOptedOut = await checkPrivacyPreferences(member.id);
  if (isUserOptedOut) {
    debug({ text: `User ${member.user.username} (${member.user.id}) is opted out. Not processing leave event.` });
    return;
  }

  debug({
    text: `User Left: \nGuild: ${member.guild.name}, ${member.guild.id} Members: ${member.guild.memberCount}\nMember: ${member.id}, ${member.displayName}`,
  });

  guildMemberRemove(member.guild.id, member.id)
}
