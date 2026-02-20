"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

type AttendeeType = {
  name: string;
};

type ScannerContextType = {
  scannedAttendee: AttendeeType;
  addScannedAttendee: (attendee: AttendeeType) => void;
};

const ScannerContext = createContext<ScannerContextType | null>(null);

export function ScannerProvider({ children }: { children: React.ReactNode }) {
  const [scannedAttendee, setScannedAttendee] = useState<AttendeeType>({
    name: "",
  });

  const addScannedAttendee = (attendee: AttendeeType) => {
    setScannedAttendee(attendee);
  };

  useEffect(() => {
    let buffer = "";
    let startTime = 0;

    const MIN_LENGTH = 15;
    const MAX_TIME = 200; // milliseconds (0.2 sec)

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      // Ignore modifier keys
      if (key.length > 1 && key !== "Enter") return;

      const now = performance.now();

      // Start new scan
      if (buffer.length === 0) {
        startTime = now;
      }

      // If Enter pressed → scanner finished input
      if (key === "Enter") {
        const duration = now - startTime;

        if (buffer.length >= MIN_LENGTH && duration <= MAX_TIME) {
          // ✅ Scanner detected
          toast.success("Scanner success!", {
            description: buffer,
          });

          // Example: update context
          setScannedAttendee({ name: buffer });
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
    <ScannerContext.Provider value={{ scannedAttendee, addScannedAttendee }}>
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
