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
  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
    <Icon className="h-4 w-4 text-white" />
    <div className="flex-1">
      <div className="text-white/60 text-xs">{label}</div>
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

export default function DynamicUserCard({ userData }) {
  return (
    <div className="mt-10 w-full place-self-center ">
      <Card className="mx-5">
        <CardHeader>
          <div className="grid grid-cols-2">
            <div className="place-self-start">
              <div className="grid grid-cols-2 gap-0">
                <Avatar className="h-15 w-15">
                  <AvatarImage src={userData[0].avatar} />
                </Avatar>
                <div className="place-self-center font-bold">
                  {userData[0].username}
                </div>
              </div>
            </div>
          </div>

          <hr className="my-3" />
        </CardHeader>
        <CardContent>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 ">
            <StatCard
              icon={UserPlus}
              label="Joins"
              value={userData[0].dataArray[0].totalJoins}
            />
            <StatCard
              icon={UserMinus}
              label="Leaves"
              value={userData[0].dataArray[0].totalLeaves}
            />
            <StatCard
              icon={MessageCircle}
              label="Total Messages"
              value={userData[0].dataArray[0].totalMessages}
            />
            <StatCard
              icon={Pen}
              label="Average Message Length"
              value={userData[0].dataArray[0].averageMessageLength}
            />
            <StatCard
              icon={MailPlus}
              label="Invites Created"
              value={userData[0].dataArray[0].totalInvites}
            />
            <StatCard
              icon={Calendar}
              label="Creation Date"
              value={`${userData[0].creationDate.slice(0, 10)} at ${userData[0].creationDate.slice(11, 19)} UTC`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
