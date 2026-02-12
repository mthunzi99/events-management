import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { SidebarGroupAction } from "./ui/sidebar";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { DatePickerWithRange } from "./DatePickerWithRange";

const eventSchema = z.object({
  event: z.string().min(1, { message: "Event title is required." }),
  venue: z.string().min(1, { message: "Venue is required." }),
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .refine((data) => data.from && data.to, {
      message: "A date range is required.",
      path: ["dateRange"],
    }),
});

const AddEvent = () => {
  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      event: "",
      venue: "",
      dateRange: {
        from: new Date(),
        to: new Date(),
      },
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <SidebarGroupAction>
          <Plus /> <span className="sr-only">Add Event</span>
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new event that can be managed and
            tracked within the system.
          </DialogDescription>
        </DialogHeader>
        <form>
          <FieldGroup>
            <Controller
              name="event"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <Label htmlFor="event-1">Event Title</Label>
                  <Input
                    id="event-1"
                    {...field}
                    placeholder="Enter event title"
                  />
                  {fieldState.error && (
                    <p className="text-sm text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </Field>
              )}
            />
            <Controller
              name="venue"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <Label htmlFor="venue-1">Venue</Label>
                  <Input
                    id="venue-1"
                    {...field}
                    placeholder="Enter venue name"
                  />
                  {fieldState.error && (
                    <p className="text-sm text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </Field>
              )}
            />
            <Controller
              name="dateRange"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <Label htmlFor="date-1">Dates</Label>
                  <DatePickerWithRange />
                  {fieldState.error && (
                    <p className="text-sm text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEvent;
