import {
  Dialog,
  DialogContent,
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

const attendeeSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  organisation: z.string().min(1, { message: "Organization is required." }),
  role: z.string().min(1, { message: "Role is required." }),
  payment_status: z.enum(["paid", "pending"], {
    message: "Payment status is required.",
  }),
  total_meals: z
    .number()
    .min(0, { message: "Total meals must be a non-negative number." }),
});

const AddPerson = () => {
  const form = useForm<z.infer<typeof attendeeSchema>>({
    resolver: zodResolver(attendeeSchema),
    defaultValues: {
      name: "",
      organisation: "",
      role: "",
      payment_status: "pending",
      total_meals: 0,
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add +</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-2xl font-bold mb-4">
          Add Person
        </DialogTitle>
        <form className="space-y-4">
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="name-1">Name</Label>
                  <Input id="name-1" {...field} placeholder="Enter full name" />
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
                </Field>
              )}
            />
            <Controller
              name="payment_status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Select
                    {...field}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <Label>Payment Status</Label>
                    <SelectTrigger className="w-full max-w-48">
                      <SelectValue placeholder="Payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Payment Status</SelectLabel>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
                    {...field}
                    placeholder="Enter total meals"
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPerson;
