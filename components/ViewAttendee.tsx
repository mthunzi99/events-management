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
import { checkInAttendee } from "@/lib/attendees";
import PrintButton from "./PrintBadgeButton";
import { People } from "./context/AttendeeProvider";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldGroup } from "./ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const attendeeSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required." }),
    organisation: z.string().min(1, { message: "Organization is required." }),
    role: z.string().min(1, { message: "Role is required." }),
    payment: z.enum(["Paid", "Unpaid", "Pending"], {
      message: "Payment status is required.",
    }),
    total_meals: z
      .number()
      .min(0, { message: "Total meals must be a non-negative number." }),
    redeemed_meals: z
      .number()
      .min(0, { message: "Redeemed meals must be a non-negative number." }),
  })
  .refine((data) => data.redeemed_meals <= data.total_meals, {
    message: "Redeemed meals must be less than or equal to total meals",
    path: ["redeemed_meals"],
  });

export function ViewAttendee() {
  const [attendee, setAttendee] = useState<People | null>(null);
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

      setAttendee(data as People);
      setLoading(false);
      //   openDialog(scannedAttendee.id);
    };

    fetchAttendee();
  }, [scannedAttendee]);

  const updateField = (field: keyof People, value: string) => {
    if (!attendee) return;
    setAttendee({ ...attendee, [field]: value });
  };

  const handlePrintMeal = async () => {
    if (!attendee) return;

    try {
      await printMealCoupon(attendee);
      toast.success("Meal coupon sent to printer");
    } catch (err) {
      toast.error("Meal coupon printing failed");
    }
  };

  const handleCheckIn = async () => {
    if (!attendee) return;

    try {
      await checkInAttendee(attendee.id);
      toast.success("Attendee checked in");
    } catch (err) {
      toast.error("Failed to check in attendee");
    }
  };

  const form = useForm<z.infer<typeof attendeeSchema>>({
    resolver: zodResolver(attendeeSchema),
    defaultValues: {
      name: attendee?.name || "",
      organisation: attendee?.organisation || "",
      role: attendee?.role || "Attendee",
      payment: attendee?.payment || "Pending",
      total_meals: attendee?.total_meals || 0,
      redeemed_meals: attendee?.redeemed_meals || 0,
    },
  });

  const onSubmit = async (data: z.infer<typeof attendeeSchema>) => {
    const { name, organisation, role, payment, total_meals, redeemed_meals } =
      data;

    const { error } = await client
      .from("Attendees")
      .update({
        name,
        organisation,
        role,
        payment,
        total_meals,
        redeemed_meals,
      })
      .eq("id", attendee?.id);

    if (error) {
      toast.error("Failed to update attendee", {
        description: error.message,
      });
      return;
    }

    toast.success("Attendee updated successfully!");
  };

  useEffect(() => {
    if (!attendee) return;

    form.setValue("name", attendee.name);
    form.setValue("organisation", attendee.organisation);
    form.setValue("role", attendee.role);
  }, [attendee, form]);

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
        <form
          onSubmit={(e) => {
            form.handleSubmit(onSubmit)();
          }}
        >
          {attendee && (
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label htmlFor="name-1">Name</Label>
                    <Input
                      id="name-1"
                      {...field}
                      placeholder="Enter full name"
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="organisation"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label htmlFor="organisation-1">Organization</Label>
                    <Input
                      id="organisation-1"
                      {...field}
                      placeholder="Enter organization name"
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Label htmlFor="role-1">Role</Label>
                    <Input id="role-1" {...field} placeholder="Enter role" />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="payment"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Select
                      {...field}
                      onValueChange={(value) => field.onChange(value)}
                      defaultValue={attendee.payment}
                    >
                      <Label>Payment Status</Label>
                      <SelectTrigger className="w-full max-w-48">
                        <SelectValue
                          placeholder="Payment status"
                          defaultValue={attendee.payment}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Payment Status</SelectLabel>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="space-y-2 flex flex-row gap-4">
                <Controller
                  name="total_meals"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Label htmlFor="total_meals-1">Total Meals</Label>
                      <Input
                        id="total_meals-1"
                        type="number"
                        min={0}
                        step={1}
                        defaultValue={attendee.total_meals || 0}
                        placeholder="Enter total meals"
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="redeemed_meals"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Label htmlFor="total_meals-1">Redeemed Meals</Label>
                      <Input
                        id="redeemed-meals-1"
                        type="number"
                        min={0}
                        step={1}
                        defaultValue={attendee.redeemed_meals || 0}
                        {...field}
                        placeholder="Enter redeemed meals"
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          )}

          <DialogFooter className="flex flex-wrap mt-4 gap-2 justify-between">
            {/* Save */}
            <Button type="submit" disabled={loading}>
              Save Changes
            </Button>

            {/* Print badge */}
            {attendee && <PrintButton person={attendee} />}

            {/* Print meal */}
            <Button variant="outline" onClick={handlePrintMeal}>
              Print Meal Coupon
            </Button>

            {/* Check-in */}
            <Button variant="outline" onClick={handleCheckIn}>
              Check-in
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
