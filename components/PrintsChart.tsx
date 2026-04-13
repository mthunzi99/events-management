"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import client from "@/api/client";
import { useEvent } from "./context/EventProvider";

type PrintRecord = {
  created_at: string;
  type: "meal" | "label";
};

type ChartRow = {
  time: string;
  label: number;
  meal: number;
};

const chartConfig = {
  label: {
    label: "ID Tags",
    color: "var(--chart-1)",
  },
  meal: {
    label: "Meal Coupons",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function aggregatePrints(records: PrintRecord[], view: string): ChartRow[] {
  const map: Record<string, ChartRow> = {};

  records.forEach((print) => {
    const date = new Date(print.created_at);
    let key = "";

    if (view === "hour") {
      key = `${date.toLocaleDateString()} ${date.getHours()}:00`;
    } else if (view === "day") {
      key = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (view === "week") {
      const week = Math.ceil(
        ((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) /
          86400000 +
          new Date(date.getFullYear(), 0, 1).getDay() +
          1) /
          7,
      );
      key = `Week ${week}`;
    }

    if (!map[key]) {
      map[key] = { time: key, label: 0, meal: 0 };
    }

    if (print.type === "label") map[key].label += 1;
    if (print.type === "meal") map[key].meal += 1;
  });

  return Object.values(map);
}

export function PrintsChart() {
  const [view, setView] = React.useState("day");
  const [records, setRecords] = React.useState<PrintRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { activeEvent } = useEvent();

  React.useEffect(() => {
    if (!activeEvent) return;

    // Initial fetch
    async function fetchPrints() {
      if (!activeEvent) return;
      setLoading(true);

      const { data, error } = await client
        .from("Prints")
        .select("created_at, type")
        .eq("event", activeEvent.event);

      if (error) {
        console.error("Failed to fetch prints:", error.message);
      } else {
        setRecords(data ?? []);
      }

      setLoading(false);
    }

    fetchPrints();

    // Real-time subscription — appends new rows as they come in
    const channel = client
      .channel(`prints:${activeEvent.event}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Prints",
          filter: `event=eq.${activeEvent.event}`,
        },
        (payload) => {
          const newRecord = payload.new as PrintRecord;
          setRecords((prev) => [...prev, newRecord]);
        },
      )
      .subscribe();

    // Cleanup subscription when event changes or component unmounts
    return () => {
      client.removeChannel(channel);
    };
  }, [activeEvent]);

  const chartData = React.useMemo(
    () => aggregatePrints(records, view),
    [records, view],
  );

  return (
    <Card className="py-0">
      <CardHeader className="flex items-center gap-2 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Printing Activity</CardTitle>
          <CardDescription>
            {loading
              ? "Loading..."
              : `${records.length} print${records.length !== 1 ? "s" : ""} recorded`}
          </CardDescription>
        </div>

        <Select value={view} onValueChange={setView}>
          <SelectTrigger className="w-35 rounded-lg sm:ml-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hour">Hourly</SelectItem>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <ScrollArea className="w-full whitespace-nowrap">
        <CardContent className="pt-6">
          {!loading && chartData.length === 0 ? (
            <div className="flex h-65 items-center justify-center text-sm text-muted-foreground">
              No print activity recorded yet.
            </div>
          ) : (
            <div className="min-w-175">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-65 w-full"
              >
                <AreaChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="meal"
                    type="monotone"
                    fill="var(--color-meal)"
                    stroke="var(--color-meal)"
                  />
                  <Area
                    dataKey="label"
                    type="monotone"
                    fill="var(--color-label)"
                    stroke="var(--color-label)"
                  />
                  <ChartLegend
                    content={<ChartLegendContent />}
                    className="mb-4 mt-0"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
}
