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
import { GuildData } from "@/app/dashboard/server/info/page";

interface StatCardParams {
  icon: React.ElementType;
  label: String;
  value: any;
}

const StatCard = ({ icon: Icon, label, value }: StatCardParams) => (
  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
    <Icon className="h-4 w-4 text-white" />
    <div className="flex-1">
      <div className="text-white/60 text-xs">{label}</div>
      {value}
    </div>
  </div>
);

export default function BottomCard({ guild }: { guild: GuildData }) {
  // Format the received data before showing them to the UI
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
    <Card className="mt-10">
      <div className="grid grid-rows-1">
        {/* Header */}
        <div className="grid grid-cols-[120px_1fr]">
          <Avatar className=" ml-5 h-20 w-20 place-self-start">
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
        <div className="mt-4 grid grid-cols-2 gap-4 p-5 md:grid-cols-3 lg:grid-cols-5">
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
                      If a server is not available, it means it’s down or in an
                      outage
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
                  <TooltipTrigger>Partnered: {partner_correct}</TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Shows if the server belongs to the Discord Partner Program
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            }
          />
          <StatCard icon={Link} label="Vanity URL" value={correct_vanity_url} />
          <StatCard
            icon={Link2}
            label="Vanity Uses"
            value={correct_vanity_uses}
          />
          <StatCard icon={Calendar} label="Created" value={correct_date} />
        </div>
      </div>
    </Card>
  );
}
