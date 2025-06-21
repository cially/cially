"use client";

import {
  Calendar,
  MailPlus,
  MessageCircle,
  Pen,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const StatCard = ({ icon: Icon, label, value, isNetGrowth = false }) => (
  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
    <Icon className="h-4 w-4 text-white" />
    <div className="flex-1">
      <div className="text-xs text-white/60">{label}</div>
      <div
        className={`font-semibold ${
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

export default function StaticUserCard() {
  return (
    <div className="place-self-center w-full mt-10 ">
      <Card className="mx-5">
        <CardHeader>
          <div className="grid grid-cols-2">
            <div className="place-self-start">
              <div className="grid grid-cols-2 gap-0">
                <Avatar className="w-15 h-15">
                  <AvatarImage src="https://cdn.discordapp.com/embed/avatars/2.png" />
                </Avatar>
                <div className="place-self-center font-bold">Example User</div>
              </div>
            </div>
          </div>

          <hr className="my-3" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-4 ">
            <StatCard icon={UserPlus} label="Joins" value="3" />
            <StatCard icon={UserMinus} label="Leaves" value="2" />
            <StatCard icon={MessageCircle} label="Total Messages" value="129" />
            <StatCard icon={Pen} label="Average Message Length" value="6" />
            <StatCard icon={MailPlus} label="Invites Created" value="10" />
            <StatCard
              icon={Calendar}
              label="Creation Date"
              value="2023-10-2 at 18:29:02 UTC"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
