import Image from "next/image";

import { Button } from "@/components/ui/button";

export default function GuildNotFound() {
  return (
    <>
      <div className="mx-10 mt-20 text-center font-extrabold text-5xl sm:mt-8">
        Guild not Found
      </div>
      <div className="w-[30vh] place-self-center sm:w-[70vh]">
        <Image alt="404 Image" height={500} src="/404.svg" width={500} />
      </div>
      <div className="place-self-center">
        <a href="/">
          <Button className=" sm:-mt-4 mt-2 " variant="secondary">
            Go Back...
          </Button>
        </a>
      </div>
    </>
  );
}
