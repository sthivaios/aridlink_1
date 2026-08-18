import React from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRightIcon } from "lucide-react";
import Footer from "@/components/footer";

export function BadgeAsLink(props: { label: string; href: string }) {
  return (
    <Badge asChild className="p-3 text-base" variant="default">
      <a href={props.href} target="_blank">
        {props.label} <ArrowUpRightIcon data-icon="inline-end" />
      </a>
    </Badge>
  );
}

function Page() {
  return (
    <div className="glass-card bg-explod flex h-screen w-full flex-col gap-6 p-25 text-white">
      <div className="flex flex-col gap-6">
        <p className="text-7xl font-light">:(</p>
        <h1 className="text-3xl font-black">Unrecoverable Application Error</h1>
      </div>

      <p className="text-xl font-bold">
        AridLink Irrigation Manager has encountered a fatal error and can&#39;t
        recover on its own.
      </p>
      <p>
        <span className="text-lg font-bold">Steps you can take:</span>
        <br /> - Restart the Docker Compose stack
        <br />- Check the Docker Compose logs
        <br />- Check the GitHub repository for a similar reported issue
        <br />- File this issue on GitHub if you believe it is a bug
      </p>
      <div>
        <p className="text-lg font-bold">Resources:</p>
        <div className="flex flex-col gap-2">
          <BadgeAsLink
            label="Submit an issue report on GitHub"
            href="https://github.com/sthivaios/aridlink_1/issues/new"
          />
          <BadgeAsLink label="AridLink Documentation" href="." />
        </div>
      </div>
      <div className="fixed right-10 bottom-10 z-50">
        <Footer alignment="right" textColor="text-white" />
      </div>
    </div>
  );
}

export default Page;
