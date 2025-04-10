import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { UsersRound, MessageCircle } from "lucide-react";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";
  import BottomCard from "./_main-components/bottom-card";

export default function BottomCard({guild}) {

    let correct_date = guild.creation_date.slice(0, 4) + "/" + guild.creation_date.slice(5, 7) + "/" + guild.creation_date.slice(11, 13)
    let correct_available = (guild.available == "true") ? "Yes" : "No"
    let partner_correct = (guild.discord_partner == "true") ? "Yes" : "No"
    

    return (
        <>
        <Card className="grid grid-cols-5 mt-10 px-10 min-w-dvh">
            <div className="col-span-1 col-start-1 w-20 h-20">
              <Avatar className=" w-20 h-20">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>Guild</AvatarFallback>
              </Avatar>
            </div>

            <div className="col-span-2 grid grid-rows-2">
              <div>
                <div className="text-2xl">{guild.name}</div>
                <div className="text-gray-400 text-xs">
                  This is the Guild Description
                </div>
              </div>
              <div className="">
                Members: {guild.members}<br></br>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>Available: {correct_available}</TooltipTrigger>
                    <TooltipContent>
                      <p>
                        If a server is not available, it means it’s down or in
                        an outage
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <br></br>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>Partnered: {partner_correct}</TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Shows if the server belongs to the Discord Partner
                        Program
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <br></br>
                Created: {correct_date}
              </div>
            </div>

            <div className="col-span-2 grid grid-rows-2">
              <div>
                <div className="text-2xl"></div>
                <div className="text-gray-400 text-xs">
                </div>
              </div>
              <div className="">
                Channels: {guild.channels}<br></br>
                Roles: {guild.roles}
                <br></br>
                Bans: {guild.bans}<br></br>
                Owner: {guild.owner_username}
              </div>
            </div>
          </Card>
        </>
    )
}