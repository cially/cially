import {
  Award,
  Ban,
  Calendar,
  Crown,
  Handshake,
  Hash,
  Info,
  Link,
  Link2,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const StatCard = ({ icon: Icon, label, value, isNetGrowth = false }) => (
  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
    <Icon className="h-4 w-4 text-white" />
    <div className="flex-1">
      <div className="text-xs text-white/60">{label}</div>
      <div
        className={`font-semibold text-sm ${
          isNetGrowth
            ? value.toString().startsWith("+")
              ? "text-green-400"
              : value.toString().startsWith("-")
                ? "text-red-400"
                : "text-white"
            : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  </div>
);

export default function BottomCard({
  guild,
}: {
  guild: {
    creation_date: string;
    available: string;
    discord_partner: string;
    description: string;
    vanity_url: string;
    vanity_uses: number;
    icon_url: string;
    owner_username: string;
    name: string;
    members: number;
    channels: number;
    roles: number;
    bans: number;
  };
}) {
  const correct_date =
    guild.creation_date.slice(0, 4) +
    "/" +
    guild.creation_date.slice(5, 7) +
    "/" +
    guild.creation_date.slice(11, 13);
  const correct_available = guild.available === "true" ? "Yes" : "No";
  const partner_correct = guild.discord_partner === "true" ? "Yes" : "No";
  const correct_description = guild.description
    ? guild.description
    : "No Description";
  const correct_vanity_url = guild.vanity_url
    ? `.gg/${guild.vanity_url}`
    : "No Vanity URL";
  const correct_vanity_uses = guild.vanity_uses
    ? guild.vanity_uses !== -1
      ? guild.vanity_uses
      : "No Permissions"
    : "-";

  return (
    <>
      <Card className="mt-10">
        <div className="grid grid-rows-1">
          {/* Header */}
          <div className="grid grid-cols-[120px_1fr]">
            <Avatar className=" h-20 w-20 place-self-start ml-5">
              <AvatarImage src={guild.icon_url} />
              <AvatarFallback>Guild</AvatarFallback>
            </Avatar>
            <div className="mt-3">
              <div className="text-2xl">{guild.name}</div>
              <div className="mb-10 text-gray-400 text-xs">
                {correct_description}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4 p-5">
            <StatCard icon={Users} label="Members" value={guild.members} />
            <StatCard icon={Award} label="Roles" value={guild.roles} />
            <StatCard icon={Hash} label="Channels" value={guild.channels} />
            <StatCard icon={Ban} label="Bans" value={guild.bans} />
            <StatCard icon={Crown} label="Owner" value={guild.owner_username} />

            <StatCard
              icon={Info}
              label="Available"
              value={
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      Available: {correct_available}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        If a server is not available, it means it’s down or in
                        an outage
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              }
            />
            <StatCard
              icon={Handshake}
              label="Partnered"
              value={
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      Partnered: {partner_correct}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Shows if the server belongs to the Discord Partner
                        Program
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              }
            />
            <StatCard
              icon={Link}
              label="Vanity URL"
              value={correct_vanity_url}
            />
            <StatCard
              icon={Link2}
              label="Vanity Uses"
              value={correct_vanity_uses}
            />
            <StatCard icon={Calendar} label="Created" value={correct_date} />
          </div>
        </div>
      </Card>
    </>
  );
}
