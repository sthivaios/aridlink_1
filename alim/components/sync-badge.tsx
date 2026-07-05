import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

export function SyncBadge(props: { synced: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant="default"
        className={` flex flex-row items-center ${!props.synced ? "text-[#FFA600FF]" : ""}`}
      >
        {props.synced ? (
          <Check data-icon="inline-start" />
        ) : (
          <X data-icon="inline-start" />
        )}
        <p className="leading-none">{props.synced ? "Synced" : "Pending"}</p>
      </Badge>
    </div>
  );
}
