import { TriangleAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import React from "react";

export function CancelScheduleEdit() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Cancel</Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="mb-0 bg-transparent">
            <TriangleAlert className="stroke-red-500" />
          </AlertDialogMedia>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>
            If you cancel now, you will lose your progress.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="default">Never mind</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              window.location.replace("/dashboard/schedules");
            }}
          >
            Yes, cancel
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
