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

export const description = "Printing activity during an event";

/*
Dummy raw records (like your database)
*/
const rawPrints = [
  { created_at: "2026-06-12T09:10:00", type: "ID tag" },
  { created_at: "2026-06-12T09:20:00", type: "Meal coupon" },
  { created_at: "2026-06-12T10:05:00", type: "ID tag" },
  { created_at: "2026-06-12T10:12:00", type: "Meal coupon" },
  { created_at: "2026-06-13T09:00:00", type: "ID tag" },
  { created_at: "2026-06-13T11:30:00", type: "Meal coupon" },
  { created_at: "2026-06-14T13:10:00", type: "Meal coupon" },
  { created_at: "2026-06-15T14:00:00", type: "ID tag" },
  { created_at: "2026-06-16T15:10:00", type: "Meal coupon" },
];

const chartConfig = {
  idTags: {
    label: "ID Tags",
    color: "var(--chart-1)",
  },
  mealCoupons: {
    label: "Meal Coupons",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

/*
Aggregation function
*/
function aggregatePrints(view: string) {
  const map: Record<
    string,
    { time: string; idTags: number; mealCoupons: number }
  > = {};

  rawPrints.forEach((print) => {
    const date = new Date(print.created_at);
    let key = "";

    if (view === "hour") {
      key = `${date.toLocaleDateString()} ${date.getHours()}:00`;
    }

    if (view === "day") {
      key = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    if (view === "week") {
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
      map[key] = {
        time: key,
        idTags: 0,
        mealCoupons: 0,
      };
    }

    if (print.type === "ID tag") map[key].idTags += 1;
    if (print.type === "Meal coupon") map[key].mealCoupons += 1;
  });

  return Object.values(map);
}

export function PrintsChart() {
  const [view, setView] = React.useState("day");

  const chartData = React.useMemo(() => {
    return aggregatePrints(view);
  }, [view]);

  return (
    <Card className="py-0">
      <CardHeader className="flex items-center gap-2 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Printing Activity</CardTitle>
          <CardDescription>Labels printed during the event</CardDescription>
        </div>

        <Select value={view} onValueChange={setView}>
          <SelectTrigger className="w-[140px] rounded-lg sm:ml-auto">
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
          <div className="min-w-[700px]">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[260px] w-full"
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
                  dataKey="mealCoupons"
                  type="monotone"
                  fill="var(--color-mealCoupons)"
                  stroke="var(--color-mealCoupons)"
                  stackId="a"
                />

                <Area
                  dataKey="idTags"
                  type="monotone"
                  fill="var(--color-idTags)"
                  stroke="var(--color-idTags)"
                  stackId="a"
                />

                <ChartLegend
                  content={<ChartLegendContent />}
                  className="mb-4 mt-0"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
}
