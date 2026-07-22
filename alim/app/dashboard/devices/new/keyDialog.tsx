import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React, { useEffect } from "react";
import { ClockIcon, Copy, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DeviceKeyDialog(props: {
  open: boolean;
  imei: string;
  device_key: string;
  onOpenChange: (state: boolean) => void;
  closeDialogCallback: () => void;
}) {
  const [warningAcknowledged, setWarningAcknowledged] = React.useState(false);

  const [countdown, setCountdown] = React.useState(5);

  useEffect(() => {
    if (warningAcknowledged || countdown === 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [props.open, countdown, warningAcknowledged]);

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent
        onEscapeKeyDown={(e) => {
          if (!warningAcknowledged) {
            e.preventDefault();
          }
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="w-full text-center">
            Authorization key for{" "}
            <span className="font-bold">{props.imei}</span>
          </AlertDialogTitle>
        </AlertDialogHeader>
        {!warningAcknowledged ? (
          <div className="flex w-full flex-col items-center gap-2">
            <ShieldAlert />
            <div className="flex w-full flex-col items-center gap-0 font-bold">
              <p>SECURITY NOTICE</p>
              <p>CREDENTIAL DISCLOSURE</p>
            </div>
            <p className="text-center">
              Please acknowledge the following before viewing the device key:
            </p>
            <p className="text-center">
              Anyone who possesses this key can act as this device. There is no
              distinction, between you (or the device) and whoever holds it.
            </p>
            <p className="text-center text-lg leading-5 font-bold tracking-tight">
              Never transmit it. Never store it. Never show it to anyone else.
              Keep it secret.
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-2">
            <div className="relative w-full rounded-md border bg-muted px-4 py-3">
              <code className="block w-full text-center font-mono text-sm break-all">
                {props.device_key}
              </code>
              <Button
                className="absolute right-1 bottom-1 h-min w-min p-0.5"
                variant="outline"
                onClick={async () => {
                  await window.navigator.clipboard.writeText(props.device_key);
                  toast.info("Key copied to clipboard", {
                    description:
                      "Try to clear it from your clipboard once you are done.",
                  });
                }}
              >
                <Copy className="h-3! w-3!" />
              </Button>
            </div>
            <p className="text-center">
              You will <span className="font-bold italic">not</span> be able to
              see this key again. Make sure to copy it now.
            </p>
            <p className="text-center leading-5 font-light tracking-tight italic">
              Never transmit it. Never store it. Never show it to anyone else.
              Keep it secret.
            </p>
          </div>
        )}
        <AlertDialogFooter>
          {!warningAcknowledged ? (
            <Button
              onClick={() => {
                setWarningAcknowledged(true);
              }}
              disabled={countdown > 0}
            >
              {countdown > 0 ? (
                <div className="flex flex-row items-end gap-2">
                  <ClockIcon />
                  <p className="leading-none">Please read ({countdown})</p>
                </div>
              ) : (
                "Acknowledge"
              )}
            </Button>
          ) : (
            <AlertDialogAction onClick={props.closeDialogCallback}>
              I have copied the key (close)
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
