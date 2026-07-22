'use client';

import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScheduleProfile } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

function ScheduleSelector(props: {
  CSPs: ScheduleProfile[] | null;
  selectionChangeCallback: (value: string) => void;
  value: string;
  CSPs_Error?: boolean;
  className?: string;
}) {
  if (props.CSPs_Error || !props.CSPs) {
    return (
      <Select>
        <SelectTrigger className="w-full" disabled={true}>
          <SelectValue placeholder="Error fetching available CSPs..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select onValueChange={props.selectionChangeCallback} value={props.value}>
      <SelectTrigger className={cn("w-full", props.className)}>
        <SelectValue placeholder="Select a CSP..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {props.CSPs.map((csp) => (
            <SelectItem key={csp.id} value={csp.id}>
              {csp.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default ScheduleSelector;