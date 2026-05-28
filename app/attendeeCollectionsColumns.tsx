"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Ellipsis, PackageCheck, PackageX } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import client from "@/api/client";
import {
  AttendeeCollection,
  ComplementOption,
} from "@/hooks/useAttendeeCollections";

// ── Collection Dialog ─────────────────────────────────────────────────────────

function ManageCollectionsDialog({
  attendee,
  complementOptions,
  open,
  onOpenChange,
}: {
  attendee: AttendeeCollection;
  complementOptions: ComplementOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [collectingAll, setCollectingAll] = useState(false);

  const uncollected = complementOptions.filter(
    (c) => !attendee.collected.includes(c.id),
  );
  const allCollected = uncollected.length === 0;

  const handleToggle = async (complementId: string) => {
    const alreadyCollected = attendee.collected.includes(complementId);
    setPending(complementId);

    if (alreadyCollected) {
      const { error } = await client
        .from("ComplementCollections")
        .delete()
        .eq("attendee_id", attendee.id)
        .eq("complement_id", complementId);

      if (error) {
        toast.error("Failed to remove collection", {
          description: error.message,
        });
      }
    } else {
      const { error } = await client.from("ComplementCollections").insert({
        attendee_id: attendee.id,
        complement_id: complementId,
      });

      if (error) {
        toast.error("Failed to record collection", {
          description: error.message,
        });
      }
    }

    setPending(null);
  };

  const handleCollectAll = async () => {
    if (uncollected.length === 0) return;

    setCollectingAll(true);

    const { error } = await client.from("ComplementCollections").insert(
      uncollected.map((c) => ({
        attendee_id: attendee.id,
        complement_id: c.id,
      })),
    );

    if (error) {
      toast.error("Failed to collect all complements", {
        description: error.message,
      });
    } else {
      toast.success(
        `All ${uncollected.length} complements marked as collected`,
      );
    }

    setCollectingAll(false);
  };

  const collectedCount = attendee.collected.length;
  const totalCount = complementOptions.length;
  const isbusy = pending !== null || collectingAll;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-2xl font-bold mb-1">
          Manage Collections
        </DialogTitle>
        <div className="mb-2">
          <p className="text-sm font-medium">{attendee.name}</p>
          <p className="text-xs text-muted-foreground">
            {attendee.organisation}
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground">
            {collectedCount} of {totalCount} complement
            {totalCount !== 1 ? "s" : ""} collected
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={isbusy || allCollected}
            onClick={handleCollectAll}
          >
            <PackageCheck className="h-4 w-4 mr-2" />
            {collectingAll
              ? "Collecting..."
              : allCollected
                ? "All collected"
                : `Collect all (${uncollected.length})`}
          </Button>
        </div>

        <div className="space-y-2">
          {complementOptions.map((complement) => {
            const isCollected = attendee.collected.includes(complement.id);
            const isLoading = pending === complement.id;

            return (
              <button
                key={complement.id}
                onClick={() => handleToggle(complement.id)}
                disabled={isbusy}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors text-left",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isCollected
                    ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                    : "bg-muted/40 border-border hover:bg-muted",
                )}
              >
                <div className="flex items-center gap-3">
                  {isCollected ? (
                    <PackageCheck className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <PackageX className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-sm font-medium">{complement.name}</span>
                </div>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    isCollected
                      ? "bg-green-500/20 text-green-700 dark:text-green-400"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {isLoading
                    ? "..."
                    : isCollected
                      ? "Collected"
                      : "Not collected"}
                </span>
              </button>
            );
          })}
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Actions Cell ──────────────────────────────────────────────────────────────

function AttendeeCollectionActions({
  attendee,
  complementOptions,
}: {
  attendee: AttendeeCollection;
  complementOptions: ComplementOption[];
}) {
  const [manageOpen, setManageOpen] = useState(false);

  return (
    <>
      <ManageCollectionsDialog
        attendee={attendee}
        complementOptions={complementOptions}
        open={manageOpen}
        onOpenChange={setManageOpen}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setManageOpen(true)}>
            Manage Collections
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

// ── Column Factory ────────────────────────────────────────────────────────────

export function createAttendeeCollectionsColumns(
  complementOptions: ComplementOption[],
): ColumnDef<AttendeeCollection>[] {
  return [
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
      accessorKey: "organisation",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Organisation
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      id: "collected",
      header: "Complements",
      cell: ({ row }) => {
        const attendee = row.original;

        return (
          <div className="flex flex-wrap gap-1.5">
            {complementOptions.map((complement) => {
              const isCollected = attendee.collected.includes(complement.id);
              return (
                <span
                  key={complement.id}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    isCollected
                      ? "bg-green-500/20 text-green-700 dark:text-green-400"
                      : "bg-muted text-muted-foreground line-through",
                  )}
                >
                  {complement.name}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      id: "summary",
      header: "Progress",
      cell: ({ row }) => {
        const collected = row.original.collected.length;
        const total = complementOptions.length;

        return (
          <span className="text-xs text-muted-foreground">
            {collected}/{total}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <AttendeeCollectionActions
          attendee={row.original}
          complementOptions={complementOptions}
        />
      ),
    },
  ];
}
