import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import client from "@/api/client";
import { useEvent } from "./context/EventProvider";

const attendeeSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  organisation: z.string().min(1, { message: "Organization is required." }),
  role: z.string().min(1, { message: "Role is required." }),
  payment: z.enum(["Paid", "Pending"], {
    message: "Payment status is required.",
  }),
  total_meals: z
    .number()
    .min(0, { message: "Total meals must be a non-negative number." }),
});

export const AddPerson = () => {
  const form = useForm<z.infer<typeof attendeeSchema>>({
    resolver: zodResolver(attendeeSchema),
    defaultValues: {
      name: "",
      organisation: "",
      role: "",
      payment: "Pending",
      total_meals: 0,
    },
  });

  const { activeEvent } = useEvent();

  async function onSubmit(data: z.infer<typeof attendeeSchema>) {
    const { name, organisation, role, payment, total_meals } = data;

    if (!activeEvent) {
      toast.error("No event selected.");
      return;
    }

    const { error } = await client
      .from("Attendees")
      .insert({
        name,
        organisation,
        role,
        payment,
        total_meals,
        event: activeEvent.event,
      })
      .single();

    if (error) {
      toast.error("Failed to create attendee", {
        description: error.message,
      });
      return;
    }

    toast.success("Attendee created successfully!");

    form.reset();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add +</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-2xl font-bold mb-4">
          Add Person
        </DialogTitle>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="name-1">Name</Label>
                  <Input id="name-1" {...field} placeholder="Enter full name" />
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
                    defaultValue={"Pending"}
                  >
                    <Label>Payment Status</Label>
                    <SelectTrigger className="w-full max-w-48">
                      <SelectValue placeholder="Payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Payment Status</SelectLabel>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
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
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : e.target.valueAsNumber,
                      )
                    }
                    placeholder="Enter total meals"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Add Person +</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPerson;
