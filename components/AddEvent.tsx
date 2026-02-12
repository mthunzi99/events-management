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
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { SidebarGroupAction } from "./ui/sidebar";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { DatePickerWithRange } from "./DatePickerWithRange";
import { toast } from "sonner";
import client from "@/api/client";

const eventSchema = z.object({
  event: z.string().min(1, { message: "Event title is required." }),
  venue: z.string().min(1, { message: "Venue is required." }),
  from_date: z.date({ message: "Start date is required." }),
  to_date: z.date({ message: "End date is required." }),
});

const AddEvent = () => {
  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      event: "",
      venue: "",
      from_date: new Date(),
      to_date: new Date(),
    },
  });

  async function onSubmit(data: z.infer<typeof eventSchema>) {
    const { event, venue, from_date, to_date } = data;

    const { error } = await client
      .from("Events")
      .insert({
        event,
        venue,
        from_date: from_date.toLocaleDateString("en-CA"),
        to_date: to_date.toLocaleDateString("en-CA"),
      })
      .single();

    if (error) {
      toast.error("Failed to create event", {
        description: error.message,
      });
      return;
    }

    toast.success("Event created successfully!");

    form.reset();
  }

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
        <form id="form-add-event" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="event"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="event-1">Event Title</Label>
                  <Input
                    id="event-1"
                    {...field}
                    placeholder="Enter event title"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="venue"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="venue-1">Venue</Label>
                  <Input
                    id="venue-1"
                    {...field}
                    placeholder="Enter venue name"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="from_date"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="date-1">Dates</Label>
                  <DatePickerWithRange
                    value={{
                      from: form.watch("from_date"),
                      to: form.watch("to_date"),
                    }}
                    onChange={(range) => {
                      if (!range) return;

                      form.setValue("from_date", range.from ?? new Date());
                      form.setValue(
                        "to_date",
                        range.to ?? range.from ?? new Date(),
                      );
                    }}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Create +</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEvent;
