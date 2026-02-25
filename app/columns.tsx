"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Ellipsis } from "lucide-react";
import { toast } from "sonner";
import { deleteAttendee, markBadgePrinted } from "@/lib/attendees";
import { printBadge } from "@/lib/printer";
import { useScannerContext } from "@/components/context/ScannerProvider";
import client from "@/api/client";

export type People = {
  id: string;
  name: string;
  organisation: string;
  role: string;
  payment: "Paid" | "Unpaid" | "Pending";
  check_in: Date;
  last_printed: Date | null;
};

export const peopleColumns: ColumnDef<People>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "organisation",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Organization
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "payment",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Payment
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status: string = row.getValue("payment") as string;
      return (
        <div
          className={cn(
            `px-2 py-1 rounded-full text-xs w-max font-medium`,
            status.toLowerCase() === "paid" && "bg-green-500/40",
            status.toLowerCase() === "unpaid" && "bg-red-500/40",
            status.toLowerCase() === "pending" && "bg-yellow-500/40",
          )}
        >
          {status as string}
        </div>
      );
    },
  },
  {
    accessorKey: "check_in",
    header: "Check-In",
    cell: ({ row }) => {
      const value = row.getValue("check_in") as Date;
      return value ? (
        new Date(value).toLocaleString()
      ) : (
        <p className="bg-red-500/50 px-2 py-1 rounded-full text-xs w-max font-medium">
          Not Checked in
        </p>
      );
    },
  },
  {
    accessorKey: "last_printed",
    header: "Last Printed",
    cell: ({ row }) => {
      const person = row.original;
      const lastPrinted = person.last_printed;

      const handlePrint = async () => {
        try {
          const loading = toast.loading("Printing badge...");

          await printBadge({
            id: person.id,
            name: person.name,
            organisation: person.organisation,
            role: person.role,
            transport: "spool",
            destination: "Xprinter XP-370B",
          });

          await markBadgePrinted(person.id);

          toast.dismiss(loading);
          toast.success("Badge printed successfully!");
        } catch (err: any) {
          toast.error("Failed to print badge", {
            description: err.message,
          });
        }
      };

      return lastPrinted ? (
        <div>{new Date(lastPrinted).toLocaleString()}</div>
      ) : (
        <Button variant="outline" size="sm" onClick={handlePrint}>
          Print Badge
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const attendee = row.original;
      const { openDialog } = useScannerContext();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <Ellipsis className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openDialog(attendee.id)}>
              View / Edit Attendee
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => deleteAttendee(attendee)}>
              Delete Attendee
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
