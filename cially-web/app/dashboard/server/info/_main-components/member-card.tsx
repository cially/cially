import { UsersRound } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MemberBlock({ guild }: { guild: { members: number } }) {
  return (
    <>
      <Card className="">
        <CardHeader>
          <CardTitle className="text-sm">
            <UsersRound className="-translate-y-0.5 mr-2 inline" />
            Current Members
          </CardTitle>
          <CardDescription className="text-2xl text-gray-300">
            {guild.members}
            <div className="mt-2 text-red-400 text-xs"></div>
          </CardDescription>
        </CardHeader>
      </Card>
    </>
  );
}
