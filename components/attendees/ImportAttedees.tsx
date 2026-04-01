"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import client from "@/api/client";
import { useEvent } from "@/components/context/EventProvider";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Match your DB columns — adjust as needed
interface AttendeeRow {
  name: string;
  organisation: string;
  role: string;
  payment: "Paid" | "Pending";
  total_meals: number;
}

// Maps CSV header names → AttendeeRow keys (case-insensitive, flexible)
const HEADER_MAP: Record<string, keyof AttendeeRow> = {
  name: "name",
  organisation: "organisation",
  organization: "organisation",
  role: "role",
  payment: "payment",
  "payment status": "payment",
  total_meals: "total_meals",
  "total meals": "total_meals",
  meals: "total_meals",
};

function parseCSV(text: string): { rows: AttendeeRow[]; errors: string[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2)
    return { rows: [], errors: ["CSV file is empty or has no data rows."] };

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
  const mappedHeaders = headers.map((h) => HEADER_MAP[h] ?? null);

  const rows: AttendeeRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    // Handle quoted fields with commas inside
    const values =
      lines[i].match(/(".*?"|[^",\r\n]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) ?? [];
    const clean = values.map((v) => v.trim().replace(/^"|"$/g, ""));

    const row: Partial<AttendeeRow> = {};
    mappedHeaders.forEach((key, idx) => {
      if (!key) return;
      const val = clean[idx] ?? "";
      if (key === "total_meals") {
        row[key] = parseInt(val, 10) || 0;
      } else if (key === "payment") {
        const normalized =
          val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
        row[key] = (
          ["Paid", "Pending"].includes(normalized) ? normalized : "Pending"
        ) as "Paid" | "Pending";
      } else {
        (row as any)[key] = val;
      }
    });

    if (!row.name) {
      errors.push(`Row ${i + 1}: Missing name — skipped.`);
      continue;
    }

    rows.push({
      name: row.name ?? "",
      organisation: row.organisation ?? "",
      role: row.role ?? "",
      payment: row.payment ?? "Pending",
      total_meals: row.total_meals ?? 0,
    });
  }

  return { rows, errors };
}

export const ImportAttendees = () => {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<AttendeeRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { activeEvent } = useEvent();

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { rows, errors } = parseCSV(text);
      setPreview(rows);
      setParseErrors(errors);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!activeEvent) {
      toast.error("No event selected.");
      return;
    }
    if (preview.length === 0) {
      toast.error("No valid rows to import.");
      return;
    }

    setLoading(true);
    const loading = toast.loading(`Importing ${preview.length} attendees...`);

    const payload = preview.map((row) => ({
      ...row,
      event: activeEvent.event,
    }));

    const { error } = await client.from("Attendees").insert(payload);

    toast.dismiss(loading);
    setLoading(false);

    if (error) {
      toast.error("Import failed", { description: error.message });
      return;
    }

    toast.success(`${preview.length} attendees imported successfully!`);
    setOpen(false);
    resetState();
  };

  const resetState = () => {
    setPreview([]);
    setParseErrors([]);
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl overflow-auto">
        <DialogTitle className="text-2xl font-bold mb-2">
          Import Attendees
        </DialogTitle>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a CSV with columns:{" "}
          <code className="bg-muted px-1 rounded">
            name, organisation, role, payment, total_meals
          </code>
        </p>

        {/* Drop zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            "hover:border-primary hover:bg-primary/5",
            fileName
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30",
          )}
          onClick={() => fileRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          {fileName ? (
            <div className="flex items-center justify-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              <span className="font-medium">{fileName}</span>
            </div>
          ) : (
            <div className="text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">
                Drop your CSV here or click to browse
              </p>
              <p className="text-xs mt-1">Only .csv files are supported</p>
            </div>
          )}
        </div>

        {/* Parse errors */}
        {parseErrors.length > 0 && (
          <div className="mt-3 space-y-1">
            {parseErrors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-yellow-600 dark:text-yellow-400"
              >
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                {err}
              </div>
            ))}
          </div>
        )}

        {/* Preview table */}
        {preview.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {preview.length} rows ready to import
            </div>
            <div className="rounded-md border overflow-auto max-h-52">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    {["Name", "Organisation", "Role", "Payment", "Meals"].map(
                      (h) => (
                        <th key={h} className="text-left px-3 py-2 font-medium">
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-1.5">{row.name}</td>
                      <td className="px-3 py-1.5">{row.organisation}</td>
                      <td className="px-3 py-1.5">{row.role}</td>
                      <td className="px-3 py-1.5">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-full font-medium",
                            row.payment === "Paid"
                              ? "bg-green-500/30"
                              : "bg-yellow-500/30",
                          )}
                        >
                          {row.payment}
                        </span>
                      </td>
                      <td className="px-3 py-1.5">{row.total_meals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleImport}
            disabled={preview.length === 0 || loading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import {preview.length > 0 ? `${preview.length} Attendees` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportAttendees;
