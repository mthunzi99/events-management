"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { complementColumns, Complement } from "@/app/complements-columns";
import { useEvent } from "@/components/context/EventProvider";
import client from "@/api/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, PackageCheck, PackageX, Percent } from "lucide-react";
import { useComplements } from "@/hooks/fetch-complements";

// ── Add Complement Dialog ─────────────────────────────────────────────────────

const addSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  description: z.string().optional(),
  total: z.number().min(1, { message: "Total must be at least 1." }),
});

function AddComplementDialog({ event }: { event: string }) {
  const form = useForm<z.infer<typeof addSchema>>({
    resolver: zodResolver(addSchema),
    defaultValues: { name: "", description: "", total: 1 },
  });

  async function onSubmit(data: z.infer<typeof addSchema>) {
    const { error } = await client.from("Complements").insert({
      name: data.name,
      description: data.description || null,
      total: data.total,
      event,
    });

    if (error) {
      toast.error("Failed to add complement", { description: error.message });
      return;
    }

    toast.success("Complement added successfully!");
    form.reset();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add +</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-2xl font-bold mb-4">
          Add Complement
        </DialogTitle>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...field}
                    placeholder="e.g. T-Shirt, USB Drive, Lanyard"
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
                  <Label htmlFor="description">
                    Description{" "}
                    <span className="text-muted-foreground text-xs">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="description"
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
                  <Label htmlFor="total">Total Available</Label>
                  <Input
                    id="total"
                    type="number"
                    min={1}
                    step={1}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 1 : e.target.valueAsNumber,
                      )
                    }
                    placeholder="How many are available"
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
              {form.formState.isSubmitting ? "Adding..." : "Add Complement +"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Summary Cards ─────────────────────────────────────────────────────────────

function SummaryCards({ complements }: { complements: Complement[] }) {
  const totalTypes = complements.length;
  const totalCollected = complements.reduce((sum, c) => sum + c.collected, 0);
  const totalAvailable = complements.reduce((sum, c) => sum + c.total, 0);
  const totalRemaining = totalAvailable - totalCollected;
  const collectionRate =
    totalAvailable > 0
      ? Math.round((totalCollected / totalAvailable) * 100)
      : 0;
  const remainingRate =
    totalAvailable > 0
      ? Math.round((totalRemaining / totalAvailable) * 100)
      : 100;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Complement Types — plain card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Complement Types
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="mx-auto text-center">
          <p className="text-3xl font-bold">{totalTypes}</p>
          <p className="text-xs text-muted-foreground mt-1">
            defined for this event
          </p>
        </CardContent>
      </Card>

      {/* Total Collected — liquid fill rising from bottom */}
      <Card className="relative overflow-hidden">
        <div
          className="bg-chart-15 absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out"
          style={{
            height: `${collectionRate}%`,
          }}
        >
          {/* Wave line at the top of the fill */}
          <div className="bg-chart-1/50 absolute top-0 left-0 w-full h-0.5" />
        </div>
        <CardHeader className="relative flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Collected
          </CardTitle>
          <PackageCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="relative mg-auto text-center">
          <p className="text-3xl font-bold">{totalCollected}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {collectionRate}% of {totalAvailable} available
          </p>
        </CardContent>
      </Card>

      {/* Remaining — liquid draining from top */}
      <Card className="relative overflow-hidden">
        <div
          className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out bg-chart-2/20"
          style={{
            height: `${remainingRate}%`,
          }}
        >
          <div className="bg-chart-2/50 absolute top-0 left-0 w-full h-0.5" />
        </div>
        <CardHeader className="relative flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Remaining
          </CardTitle>
          <PackageX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="relative mg-auto text-center">
          <p className="text-3xl font-bold">{totalRemaining}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {remainingRate}% yet to be collected
          </p>
        </CardContent>
      </Card>

      {/* Collection Rate — plain card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Collection Rate
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="mx-auto text-center">
          <p className="text-3xl font-bold">{collectionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            of all complements claimed
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ComplementsPage() {
  const { activeEvent } = useEvent();
  const { complements, loading } = useComplements();

  if (!activeEvent) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        Select an event from the sidebar to manage its complements.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Complements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeEvent.event}
          </p>
        </div>
        <AddComplementDialog event={activeEvent.event} />
      </div>

      <SummaryCards complements={complements} />

      {loading ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
          Loading complements...
        </div>
      ) : (
        <DataTable columns={complementColumns} data={complements} />
      )}
    </div>
  );
}
