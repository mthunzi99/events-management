"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

type AttendeeType = {
  id: string;
};

type ScannerContextType = {
  scannedAttendee: AttendeeType | null;
  addScannedAttendee: (attendee: AttendeeType) => void;

  openDialog: (id: string) => void;
  closeDialog: () => void;

  isDialogOpen: boolean;
};

const ScannerContext = createContext<ScannerContextType | null>(null);

export function ScannerProvider({ children }: { children: React.ReactNode }) {
  const [scannedAttendee, setScannedAttendee] = useState<AttendeeType | null>(
    null,
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addScannedAttendee = (attendee: AttendeeType) => {
    setScannedAttendee(attendee);
  };

  const openDialog = (id: string) => {
    setScannedAttendee({ id });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setScannedAttendee(null);
    setIsDialogOpen(false);
  };

  useEffect(() => {
    let buffer = "";
    let startTime = 0;

    const LENGTH = 35;
    const MAX_TIME = 400; // milliseconds (0.4 sec)

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const key = e.key;

      if (key.length > 1 && key !== "Enter") return;

      const now = performance.now();

      // Start new scan
      if (buffer.length === 0) {
        startTime = now;
      }

      // If Enter pressed → scanner finished input
      if (key === "Enter") {
        const duration = now - startTime;

        if (buffer.length >= LENGTH && duration <= MAX_TIME) {
          if (isDialogOpen) return;

          // ✅ Scanner detected
          toast.success("Scanner success!", {
            description: buffer,
          });

          // Update context
          openDialog(buffer);
        }

        buffer = "";
        return;
      }

      buffer += key;

      // Safety reset if human typing too slow
      if (now - startTime > MAX_TIME) {
        buffer = "";
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <ScannerContext.Provider
      value={{
        scannedAttendee,
        addScannedAttendee,
        openDialog,
        closeDialog,
        isDialogOpen,
      }}
    >
      {children}
    </ScannerContext.Provider>
  );
}

export function useScannerContext() {
  const context = useContext(ScannerContext);
  if (!context) {
    throw new Error("useScannerContext must be used within a ScannerProvider");
  }
  return context;
}
