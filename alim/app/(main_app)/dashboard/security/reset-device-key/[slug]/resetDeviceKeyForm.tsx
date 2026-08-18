"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Device, ScheduleProfile } from "@/lib/generated/prisma/client";
import { tryCatch } from "@/lib/try-catch";
import { resetDeviceKey } from "@/app/(main_app)/dashboard/security/reset-device-key/[slug]/reset-device-key";
import { toast } from "sonner";
import { DeviceKeyDialog } from "@/app/(main_app)/dashboard/devices/new/keyDialog";
import { redirect } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

function ResetDeviceKeyForm(props: {
  device: Device & { scheduleProfile: ScheduleProfile | null };
}) {
  const [showKey, setShowKey] = React.useState(false);
  const [key, setKey] = React.useState<string>("");

  const [understandIrriversible, setUnderstandIrriversible] =
    React.useState(false);
  const [understandManualConfig, setUnderstandManualConfig] =
    React.useState(false);

  async function handleKeyReset() {
    const { data, error } = await tryCatch(resetDeviceKey(props.device.imei));

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Device authorization key reset successfully.", {
        description: `For device with IMEI ${props.device.imei}`,
      });
      setKey(data.deviceKey);
      setShowKey(true);
    }
  }

  async function keyDialogOpenChange(e: boolean) {
    setShowKey(e);
  }

  return (
    <form className="flex w-full flex-col items-start gap-5">
      <h1 className="text-2xl">AridLink Device Authorization Key Reset</h1>
      <Separator />
      <div className="flex flex-col gap-2">
        <h2 className="text-lg">Device Information</h2>
        <div className="grid grid-cols-[max-content_1fr_max-content] items-center gap-x-4 gap-y-4">
          <Label>IMEI</Label>
          <Input className="min-w-xl" value={props.device.imei} readOnly />
          <Link
            href={`/dashboard/devices/${props.device.imei}`}
            className="flex flex-row items-center gap-1 text-sm text-nowrap text-blue-400 transition-all duration-200 hover:text-primary hover:underline"
          >
            View device <ArrowRight size={16} />
          </Link>

          <Label>Name</Label>
          <Input
            className="min-w-xl"
            value={props.device.name ?? ""}
            readOnly
          />
          <div />

          <Label>Location Description</Label>
          <Input
            className="min-w-xl"
            value={props.device.locationDescription ?? ""}
            readOnly
          />
          <div />

          <Label>Assigned CSP</Label>
          <Input
            className="min-w-xl"
            value={props.device.scheduleProfile?.name ?? ""}
            readOnly
          />
          {props.device.scheduleProfile ? (
            <Link
              href={`/dashboard/schedules/${props.device.scheduleProfile.id}`}
              target="_blank"
              className="flex flex-row items-center gap-1 text-sm text-nowrap text-blue-400 transition-all duration-200 hover:text-primary hover:underline"
            >
              View CSP (new tab) <ArrowRight size={16} />
            </Link>
          ) : null}
        </div>
      </div>
      <Separator />
      <div className="flex w-[40%] flex-col gap-4 text-justify">
        <p className="font-bold">
          You are about to reset the authorization key for this device.
        </p>
        <p>
          Please note that this action{" "}
          <span className="font-bold">
            will cause the device to be locked out of the server
          </span>{" "}
          until it is manually configured to use the new key. If you are not
          able to currently access the device physically, you should consider
          not resetting the key unless there is an important enough reason.
        </p>
        <div className="flex flex-row items-end gap-2">
          <Checkbox
            checked={understandIrriversible}
            onCheckedChange={(e) => setUnderstandIrriversible(e === true)}
            className="rounded-none"
          />
          <Label className="text-sm leading-none">
            I understand that this action is non reversible.
          </Label>
        </div>
        <div className="flex flex-row items-end gap-2">
          <Checkbox
            checked={understandManualConfig}
            onCheckedChange={(e) => setUnderstandManualConfig(e === true)}
            className="rounded-none"
          />
          <Label className="text-sm leading-none">
            I understand that the device will have to manually be reconfigured.
          </Label>
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <Button
          type="button"
          onClick={handleKeyReset}
          disabled={!understandIrriversible || !understandManualConfig}
        >
          Reset authorization key
        </Button>
      </div>
      <DeviceKeyDialog
        open={showKey}
        imei={props.device.imei}
        onOpenChange={keyDialogOpenChange}
        device_key={key}
        closeDialogCallback={() => {
          setShowKey(false);
          setKey("");
          redirect("/dashboard/devices");
        }}
      />
    </form>
  );
}

export default ResetDeviceKeyForm;
