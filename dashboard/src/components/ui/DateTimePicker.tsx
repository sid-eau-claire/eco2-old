import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

export function DateTimePicker({
  date,
  setDate
}: {
  date: Date;
  setDate: (date: Date) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const updatedDate = new Date(newDate.setHours(date.getHours(), date.getMinutes()));
      setSelectedDate(updatedDate);
      setDate(updatedDate);
    }
  };

  const handleTimeSelect = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(selectedDate || date);
    newDate.setHours(hours, minutes);
    setDate(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP HH:mm") : <span>Pick a date and time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[9999]">
        <div className="flex">
          <div className="p-4 bg-blue-100">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              className="rounded-md border bg-white"
            />
          </div>
          <div className="w-40 border-l bg-gray-50">
            <div className="p-3 border-b bg-blue-100">
              <h3 className="font-semibold text-center">Time</h3>
            </div>
            <div className="h-[280px] overflow-y-auto">
              {timeOptions.map((time) => (
                <Button
                  key={time}
                  variant="ghost"
                  className={cn(
                    "w-full justify-center py-1 px-2",
                    time === format(date, "HH:mm") && "bg-blue-200 text-blue-800"
                  )}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}