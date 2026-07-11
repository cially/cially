import { Events, GuildMember } from "discord.js";
import { debug } from "../terminal/debug";
import { checkPrivacyPreferences } from "../http/API/functions/logic/checkPrivacyPreferences";
import { guildMemberAdd } from "../http/API/functions/guildMemberAdd";

export const name = Events.GuildMemberAdd;
export async function execute(member: GuildMember) {
  // Check if author is opted out early to save resources
  const isUserOptedOut = await checkPrivacyPreferences(member.id);
  if (isUserOptedOut) {
    debug({ text: `User ${member.user.username} (${member.user.id}) is opted out. Not processing join event.` });
    return;
  }

  debug({
    text: `User Joined: \nGuild: ${member.guild.name}, ${member.guild.id}, Members: ${member.guild.memberCount}\nMember: ${member.id}, ${member.displayName}`,
  });

  guildMemberAdd(member.guild.id, member.id)
}
