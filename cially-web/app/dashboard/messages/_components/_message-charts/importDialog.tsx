"use client";

import { Siren, FolderClock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

export default function ImportDialogCard(guildID) {
  const router = useRouter();

  const handleSumbit = async (guildID) => {
    try {
      const response = await fetch(
        `/api/server/${guildID.guildID}/scrapeMessages`
      );
      console.log(guildID.guildID);

      if (response.ok) {
        console.log("Succesfull Response from /");
        router.push("/");
      } else {
        const errorData = await response.json();
        console.log(errorData);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  return (
    <>
      <Card className="mt-10 grid  auto-rows-auto px-10 sm:min-w-dvh">
        <div>
          <div className="text-xl font-semibold">
            <FolderClock className="inline mr-2" />
            Retrieve Data
          </div>
          <div className="font-sans text-sm text-white/50 mt-2">
            <div>
              With Cially, you can retrieve all messages from your Discord
              server from the past 4 weeks for more accurate insights!
            </div>
            For larger servers, this process may take up to 30 minutes to
            complete.
            <div className="my-5" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div className="place-self-center">
                  <Button className=" bg-gray-700 text-white hover:bg-gray-800 transition-all">
                    Retrieve Data
                  </Button>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white/5 backdrop-blur-2xl rounded-lg border border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    <Siren className="inline mr-2 -translate-y-1" />
                    Heads up!
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    This action will erase all the message data of your server.
                    Once done so, it will start scraping every single channel
                    the bot has access to and save message log of up to 4 weeks.
                    <br />
                    <br />
                    Please proceed once you've made sure that nothing can cause
                    a downtime to your bot. Also make sure to enable debugging
                    if you want to see details regarding the scraping procedure
                    <br />
                    <br />
                    While Cially is respecting Discord's TOS regarding API
                    requests, if Discord decides to ratelimit your bot for any
                    reason, the procedure will stop automatically. We advise you
                    to not re-run the scrape if done so, and wait for 24 hours
                    first
                    <br />
                    <br />
                    If there is an ongoing scrape going on, clicking the button
                    below won't do anything. Restart your bot if you want to
                    stop the scraper
                    <br />
                    <br />
                    Click "Continue" to proceed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleSumbit(guildID)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>
    </>
  );
}
