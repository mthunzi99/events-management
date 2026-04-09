import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useEffect } from "react";

const supportGroupSchema = z.object({
  organisation: z.string().min(1, { message: "Organization is required." }),
  role: z.string().min(1, { message: "Role is required." }),
  total_coupons: z
    .number()
    .min(1, { message: "Total coupons must be at least 1." }),
});

export const AddSupportGroup = () => {
  const form = useForm<z.infer<typeof supportGroupSchema>>({
    resolver: zodResolver(supportGroupSchema),
    defaultValues: {
      organisation: "",
      role: "",
      total_coupons: 1,
    },
  });

  const { activeEvent } = useEvent();

  async function onSubmit(data: z.infer<typeof supportGroupSchema>) {
    if (!activeEvent) {
      toast.error("No event selected.");
      return;
    }

    const { error } = await client
      .from("SupportGroups")
      .insert({
        organisation: data.organisation,
        role: data.role,
        total_coupons: data.total_coupons,
        event: activeEvent.event,
      })
      .single();

    if (error) {
      toast.error("Failed to create support group", {
        description: error.message,
      });
      return;
    }

    toast.success("Support group added successfully!");
    form.reset();
  }

  // Reset total_coupons to event default when event changes, if available
  useEffect(() => {
    if (activeEvent?.default_num_meals != null) {
      form.reset({
        ...form.getValues(),
        total_coupons: activeEvent.default_num_meals,
      });
    }
  }, [activeEvent, form]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Support Group +</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-2xl font-bold mb-4">
          Add Support Staff Group
        </DialogTitle>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="organisation"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="organisation-1">Organization</Label>
                  <Input
                    id="organisation-1"
                    {...field}
                    placeholder="e.g. ACME Corp"
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
                  <Input
                    id="role-1"
                    {...field}
                    placeholder="e.g. Drivers, Security"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="total_coupons"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="total_coupons-1">Number of Coupons</Label>
                  <Input
                    id="total_coupons-1"
                    type="number"
                    min={1}
                    step={1}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 1 : e.target.valueAsNumber,
                      )
                    }
                    placeholder="Enter number of meal coupons"
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
            <Button type="submit">Add Group +</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupportGroup;
