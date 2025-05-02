"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import GuildNotFound from "@/app/_components/_events/guildNotFound";
import LoadingSVG from "@/app/_components/_events/loading-page";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ActiveChannels from "../activity/_components/active_channels";
import ActiveHours from "../activity/_components/active_hours";
import ActiveUsers from "../activity/_components/active_users";
import GeneralActivityData from "./_components/general_data";

let WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

// FIXME Error when there are no messages

export default function MessagesDashboard() {
    const searchParams = useSearchParams();
    const guildID = searchParams.get("guildID");
    const [chartData, setChartData] = useState([{ amount: 69 }]);

    useEffect(() => {
        async function fetchData() {
            let chartDataReceived = await fetch(
                `${WEBSITE_URL}/api/server/${guildID}/fetchActivityData`,
            );
            let json = await chartDataReceived.json();
            setChartData(json);
            console.log(json)
        }
        fetchData();
    }, [guildID]);

    if (chartData.notFound) {
        return <GuildNotFound />
    } else if (!chartData.finalData) {
        return (
            <div className="translate-x-100">
                <LoadingSVG />
            </div>
        );
    } else {
        let data_channels = chartData.finalData[0].ChannelData;
        let data_users = chartData.finalData[0].ActiveUsersData;
        let data_hours = chartData.finalData[0].ActiveHourData;
        let data_general = chartData.finalData[0].GeneralData;

        return (
            <>

                <div className="mt-10 ml-10 text-2xl">Activity Analytics</div>
                <hr className="mt-2 mr-5 ml-5 w-50 sm:w-dvh"></hr>

                <div className="h-[90%]">

                    <div className="grid grid-cols-2 ml-10 mr-5 mt-10 gap-5">
                        <div>
                            <ActiveChannels chartData={data_channels} />
                        </div>
                        <div>
                            <ActiveUsers chartData={data_users} />
                        </div>
                    </div>

                    <div className="ml-10 mr-5 mt-5">
                        <ActiveHours chartData={data_hours} />

                        <div className="mt-5">
                            <GeneralActivityData chartData={data_general} />

                        </div>

                    </div>
                </div>



                <div className="mt-5 pb-5 text-center text-gray-600 text-xs">
                    Thanks for using Cially Dashboard!
                </div>
            </>
        );
    }
}
