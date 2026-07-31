import { MessageCircle } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GuildData } from "@/app/dashboard/server/info/page";

export default function MessagesBlock({ guild }: { guild: GuildData }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">
          <MessageCircle className="-translate-y-0.5 mr-2 inline" />
          Messages Today
        </CardTitle>
        <CardDescription className="text-2xl text-gray-300">
          {guild.today_msg}
          <div className="mt-2 text-xs">
            {guild.msg_day_difference > 0 ? (
              <div className="text-green-400">
                +{guild.msg_day_difference} than yesterday
              </div>
            ) : guild.msg_day_difference !== 0 ? (
              <div className="text-red-400">
                {guild.msg_day_difference} than yesterday
              </div>
            ) : (
              <div className="text-gray-400">
                +{guild.msg_day_difference} than yesterday
              </div>
            )}
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
