"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useScannerContext } from "@/components/context/ScannerProvider";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import client from "@/api/client";
import { toast } from "sonner";
import { printMealCoupon } from "@/lib/printer";

type Attendee = {
  id: string;
  name: string;
  organisation: string;
  role: string;
};

export function ViewAttendee() {
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [loading, setLoading] = useState(false);

  const { scannedAttendee, isDialogOpen, openDialog, closeDialog } =
    useScannerContext();

  useEffect(() => {
    if (!scannedAttendee?.id) return;

    const fetchAttendee = async () => {
      setLoading(true);

      const { data, error } = await client
        .from("Attendees")
        .select("*")
        .eq("id", scannedAttendee.id)
        .single();

      if (error) {
        toast.error("Attendee not found");
        setLoading(false);
        return;
      }

      setAttendee(data as Attendee);
      setLoading(false);
      //   openDialog(scannedAttendee.id);
    };

    fetchAttendee();
  }, [scannedAttendee]);

  const updateField = (field: keyof Attendee, value: string) => {
    if (!attendee) return;
    setAttendee({ ...attendee, [field]: value });
  };

  const handleSave = async () => {
    if (!attendee) return;

    setLoading(true);

    const { error } = await client
      .from("Attendees")
      .update({
        name: attendee.name,
        organisation: attendee.organisation,
        role: attendee.role,
      })
      .eq("id", attendee.id);

    setLoading(false);

    if (error) {
      toast.error("Failed to update attendee");
      return;
    }

    toast.success("Attendee updated");
  };

  const handlePrintBadge = async () => {
    if (!attendee) return;

    try {
      // await printBadge(attendee.id);
      toast.success("Badge sent to printer");
    } catch {
      toast.error("Badge printing failed");
    }
  };

  const handlePrintMeal = async () => {
    if (!attendee) return;

    try {
      await printMealCoupon(attendee.id);
      toast.success("Meal coupon sent to printer");
    } catch (err) {
      toast.error("Meal coupon printing failed");
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        if (open == false) closeDialog();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Attendee</DialogTitle>
        </DialogHeader>
        {attendee && (
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={attendee.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            <div>
              <Label>Organisation</Label>
              <Input
                value={attendee.organisation}
                onChange={(e) => updateField("organisation", e.target.value)}
              />
            </div>

            <div>
              <Label>Role</Label>
              <Input
                value={attendee.role}
                onChange={(e) => updateField("role", e.target.value)}
              />
            </div>

            <p className="text-xs text-muted-foreground">ID: {attendee.id}</p>
          </div>
        )}

        <DialogFooter className="flex flex-wrap gap-2 justify-between">
          {/* Save */}
          <Button onClick={handleSave} disabled={loading}>
            Save Changes
          </Button>

          {/* Print badge */}
          <Button variant="secondary" onClick={handlePrintBadge}>
            Print Badge
          </Button>

          {/* Print meal */}
          <Button variant="outline" onClick={handlePrintMeal}>
            Print Meal Coupon
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
