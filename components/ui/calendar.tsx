"use client";

import * as React from "react";
import type { CalendarProps } from "react-calendar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomCalendarProps {
  className?: string;
  onChange: CalendarProps['onChange'];
  value: CalendarProps['value'];
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ className, onChange, value }) => {
  return (
    <div className={cn("p-3", className)}>
      <Calendar
        onChange={onChange}
        value={value}
        tileClassName={({ date, view }) =>
          view === "month" && date.getDay() === new Date().getDay()
            ? "bg-accent text-accent-foreground"
            : ""
        }
        nextLabel={<ChevronRight className="h-4 w-4" />}
        prevLabel={<ChevronLeft className="h-4 w-4" />}
      />
    </div>
  );
};

CustomCalendar.displayName = "CustomCalendar";

export { CustomCalendar };
