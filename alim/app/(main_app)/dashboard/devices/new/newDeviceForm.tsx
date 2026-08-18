"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CancelScheduleEdit } from "@/components/cancel";
import { Button } from "@/components/ui/button";
import { DeviceKeyDialog } from "@/app/(main_app)/dashboard/devices/new/keyDialog";
import { createDevice } from "@/app/(main_app)/dashboard/devices/new/create-device";
import { tryCatch } from "@/lib/try-catch";
import { toast } from "sonner";
import ScheduleSelector from "@/components/schedule_selector";
import { ScheduleProfile } from "@/lib/generated/prisma/client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function NewDeviceForm(props: {
  CSPs: ScheduleProfile[] | null;
  CSPs_Error?: boolean;
}) {
  const [imei, setImei] = React.useState<string>("");
  const [confirmImei, setConfirmImei] = React.useState<string>("");
  const [name, setName] = React.useState<string>("");
  const [locationDescription, setLocationDescription] =
    React.useState<string>("");
  const [assignedCSP, setAssignedCSP] = React.useState<string>("");
  const [showKey, setShowKey] = React.useState(false);
  const [key, setKey] = React.useState<string>("");

  const requirements = {
    imei_confirmed: imei == confirmImei,
    valid_imei_length: imei.length == 15,
    name_present: name.length > 0,
  };

  async function handleCreate() {
    const { data, error } = await tryCatch(
      createDevice(imei, name, locationDescription, assignedCSP)
    );

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Device created successfully.");
      setKey(data.deviceKey);
      setShowKey(true);
    }
  }

  async function keyDialogOpenChange(e: boolean) {
    setShowKey(e);
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
            value={imei}
            onChange={(e) => setImei(e.target.value)}
          />
          <div />

          <Label>Confirm IMEI *</Label>
          <Input
            className="min-w-xl"
            value={confirmImei}
            onChange={(e) => setConfirmImei(e.target.value)}
          />
          <div />

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
            href="/app/(main_app)/dashboard/schedules/new"
            className="flex flex-row items-center gap-1 text-sm text-nowrap text-blue-400 transition-all duration-200 hover:text-primary hover:underline"
          >
            Create a new CSP <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <CancelScheduleEdit hrefToReturnTo="/dashboard/devices" />
        <Button
          type="button"
          onClick={handleCreate}
          disabled={!Object.values(requirements).every(Boolean)}
        >
          Save and submit
        </Button>
      </div>
      <p className="text-sm text-muted-foreground italic">
        * Indicates required field
      </p>
      <DeviceKeyDialog
        open={showKey}
        imei={imei}
        onOpenChange={keyDialogOpenChange}
        device_key={key}
        closeDialogCallback={() => {
          setShowKey(false);
          setKey("");
        }}
      />
    </form>
  );
}

export default NewDeviceForm;
