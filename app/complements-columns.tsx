"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowUpDown, Ellipsis } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import client from "@/api/client";

export type Complement = {
  id: string;
  event: string;
  name: string;
  description: string | null;
  total: number;
  collected: number; // aggregated count from ComplementCollections
};

const editSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  description: z.string().optional(),
  total: z.number().min(0, { message: "Total must be a non-negative number." }),
});

// ── Edit Dialog ──────────────────────────────────────────────────────────────

function EditComplementDialog({
  complement,
  open,
  onOpenChange,
}: {
  complement: Complement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: complement.name,
      description: complement.description ?? "",
      total: complement.total,
    },
  });

  async function onSubmit(data: z.infer<typeof editSchema>) {
    const { error } = await client
      .from("Complements")
      .update({
        name: data.name,
        description: data.description ?? null,
        total: data.total,
      })
      .eq("id", complement.id);

    if (error) {
      toast.error("Failed to update complement", {
        description: error.message,
      });
      return;
    }

    toast.success("Complement updated successfully!");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-2xl font-bold mb-4">
          Edit Complement
        </DialogTitle>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    {...field}
                    placeholder="e.g. T-Shirt, USB Drive"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="edit-description">
                    Description{" "}
                    <span className="text-muted-foreground text-xs">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="edit-description"
                    {...field}
                    placeholder="Any extra details"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="total"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="edit-total">Total Available</Label>
                  <Input
                    id="edit-total"
                    type="number"
                    min={0}
                    step={1}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : e.target.valueAsNumber,
                      )
                    }
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
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Actions Cell ─────────────────────────────────────────────────────────────

function ComplementActions({ complement }: { complement: Complement }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    const { error } = await client
      .from("Complements")
      .delete()
      .eq("id", complement.id);

    if (error) {
      toast.error("Failed to delete complement", {
        description: error.message,
      });
    } else {
      toast.success(`"${complement.name}" deleted`);
    }

    setDeleting(false);
    setDeleteOpen(false);
  };

  return (
    <>
      <EditComplementDialog
        complement={complement}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{complement.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this complement and all{" "}
              {complement.collected} collection record
              {complement.collected !== 1 ? "s" : ""} associated with it. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

// ── Column Definitions ───────────────────────────────────────────────────────

export const complementColumns: ColumnDef<Complement>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.getValue("description") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "collected",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Collected
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: "remaining",
    header: "Remaining",
    cell: ({ row }) => {
      const remaining = row.original.total - row.original.collected;
      return (
        <span className={remaining === 0 ? "text-destructive font-medium" : ""}>
          {remaining}
        </span>
      );
    },
  },
  {
    id: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const { total, collected } = row.original;
      const pct = total > 0 ? Math.min((collected / total) * 100, 100) : 0;

      return (
        <div className="flex items-center gap-2 min-w-32">
          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-8 text-right">
            {Math.round(pct)}%
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ComplementActions complement={row.original} />,
  },
];
