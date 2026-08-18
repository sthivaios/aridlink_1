"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CancelScheduleEdit } from "@/components/cancel";
import { Button } from "@/components/ui/button";
import ScheduleSelector from "@/components/schedule_selector";
import { Device, ScheduleProfile } from "@/lib/generated/prisma/client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { editDevice } from "@/app/(main_app)/dashboard/devices/[slug]/edit-device";
import { tryCatch } from "@/lib/try-catch";
import { toast } from "sonner";

function EditDeviceForm(props: {
  CSPs: ScheduleProfile[] | null;
  device: Device;
  CSPs_Error?: boolean;
}) {
  const [name, setName] = React.useState<string>(props.device.name ?? "");
  const [locationDescription, setLocationDescription] = React.useState<string>(
    props.device.locationDescription ?? ""
  );
  const [assignedCSP, setAssignedCSP] = React.useState<string>(
    props.device.scheduleProfileId ?? ""
  );

  async function handleUpdate() {
    const { error } = await tryCatch(
      editDevice(props.device.imei, {
        name,
        locationDescription,
        CSP_ID: assignedCSP,
      })
    );

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Device updated successfully.");
    }
  }

  return (
    <form className="flex w-full flex-col items-start gap-5">
      <h1 className="text-2xl">AridLink Device Registration Wizard</h1>
      <Separator />
      <div className="flex flex-col gap-2">
        <h2 className="text-lg">Device Information</h2>
        <div className="grid grid-cols-[max-content_1fr_max-content] items-center gap-x-4 gap-y-4">
          <Label>IMEI *</Label>
          <Input
            className="min-w-xl"
            value={props.device.imei}
            readOnly={true}
          />
          <Link
            href={`/dashboard/security/reset-device-key/${props.device.imei}`}
            className="flex flex-row items-center gap-1 text-sm text-nowrap text-blue-400 transition-all duration-200 hover:text-primary hover:underline"
          >
            Reset device key <ArrowRight size={16} />
          </Link>

          <Label>Name *</Label>
          <Input
            className="min-w-xl"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div />

          <Label>Location Description</Label>
          <Input
            className="min-w-xl"
            value={locationDescription}
            onChange={(e) => setLocationDescription(e.target.value)}
          />
          <div />

          <Label>Assigned CSP</Label>
          <ScheduleSelector
            CSPs={props.CSPs}
            CSPs_Error={props.CSPs_Error}
            selectionChangeCallback={(newValue) => {
              setAssignedCSP(newValue);
            }}
            value={assignedCSP}
          />
          <Link
            href={`/dashboard/schedules/${assignedCSP}`}
            target="_blank"
            className="flex flex-row items-center gap-1 text-sm text-nowrap text-blue-400 transition-all duration-200 hover:text-primary hover:underline"
          >
            View CSP (new tab) <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <CancelScheduleEdit hrefToReturnTo="/dashboard/devices" />
        <Button type="button" onClick={handleUpdate}>
          Save and submit
        </Button>
      </div>
      <p className="text-sm text-muted-foreground italic">
        * Indicates required field
      </p>
    </form>
  );
}

export default EditDeviceForm;
