import { Badge } from "@/components/ui/badge";
import { ArrowUpRightIcon } from "lucide-react";

export function OpenDeviceBadge(props: { href: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge asChild variant="default" className="">
        <a href={props.href} className="flex flex-row items-center">
          <span className="leading-none">View device</span> <ArrowUpRightIcon data-icon="inline-end" />
        </a>
      </Badge>
    </div>
  );
}