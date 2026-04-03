"use client";

import { Table } from "@tanstack/react-table";
import { Printer, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { bulkDeleteAttendees, bulkPrintBadges } from "@/lib/attendees";
import { toast } from "sonner";

interface AttendeeTableToolbarProps<TData extends { id: string }> {
  table: Table<TData>;
}

export function AttendeeTableToolbar<TData extends { id: string }>({
  table,
}: AttendeeTableToolbarProps<TData>) {
  const [deleting, setDeleting] = useState(false);
  const [printing, setPrinting] = useState(false);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original.id);
  const count = selectedIds.length;

  if (count === 0) return null;

  const handleDelete = async () => {
    setDeleting(true);
    await bulkDeleteAttendees(selectedIds);
    table.resetRowSelection();
    setDeleting(false);
  };

  const handleBulkPrint = async () => {
    const attendees = selectedRows.map(
      (row) =>
        row.original as TData & {
          name: string;
          organisation: string;
          role: string;
          event: string;
        },
    );

    // Warn if some badges were already printed
    const alreadyPrinted = attendees.filter(
      (a) => (a as any).last_printed != null,
    );
    if (alreadyPrinted.length > 0 && alreadyPrinted.length < count) {
      toast.info(
        `${alreadyPrinted.length} badge${alreadyPrinted.length > 1 ? "s have" : " has"} already been printed and will be reprinted.`,
      );
    }

    setPrinting(true);
    const loading = toast.loading(
      `Printing ${count} badge${count > 1 ? "s" : ""}...`,
    );
    await bulkPrintBadges(attendees);
    toast.dismiss(loading);
    table.resetRowSelection();
    setPrinting(false);
  };

  const isLoading = deleting || printing;
  const allPrinted = selectedRows.every(
    (row) => (row.original as any).last_printed != null,
  );

  return (
    <div className="flex items-center gap-3 px-1">
      {/* Bulk Print */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            disabled={isLoading}
            className="cursor-pointer"
          >
            <Printer />
            {allPrinted ? "Reprint" : "Print"} {count} badge
            {count > 1 ? "s" : ""}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {allPrinted ? "Reprint" : "Print"} {count} badge
              {count > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {allPrinted
                ? `All ${count} selected badge${count > 1 ? "s have" : " has"} already been printed. Are you sure you want to reprint ${count > 1 ? "them" : "it"}?`
                : `This will send ${count} badge${count > 1 ? "s" : ""} to the printer. Badges that have already been printed will be reprinted.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkPrint} disabled={isLoading}>
              {printing ? "Printing..." : "Print"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="lg"
            disabled={isLoading}
            className="cursor-pointer"
          >
            <Trash2 />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {count} attendee{count > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              {count === 1 ? "the selected attendee" : `${count} attendees`}{" "}
              from the event. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
