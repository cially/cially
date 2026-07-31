import { Events, Invite } from "discord.js";
import { debug } from "../terminal/debug";
import { checkPrivacyPreferences } from "../http/API/functions/logic/checkPrivacyPreferences";
import { inviteCreate } from "../http/API/functions/inviteCreate";

export const name = Events.InviteCreate;
export async function execute(invite: Invite) {
  const inviterId = invite.inviter?.id;
  if (!inviterId) return;

  // Check if author is opted out early to save resources
  const isUserOptedOut = await checkPrivacyPreferences(inviterId);
  if (isUserOptedOut) {
    debug({ text: `User ${invite.inviter?.username} (${inviterId}) is opted out. Not processing invite event.` });
    return;
  }

  debug({
    text: `New Invite Created: \nGuild: ${invite.guild?.name}, ${invite.guild}\nChannel: ${invite.channel?.name}, ${invite.channelId}\nInviter: ${invite.inviterId}\n`,
  });

  inviteCreate(invite.guild?.id, invite.channelId, invite.inviterId)
}
