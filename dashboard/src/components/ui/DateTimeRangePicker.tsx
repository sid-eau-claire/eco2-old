import React, { useState, useEffect } from "react";
import { format, addMonths, isSameMonth, isSameDay, isAfter, isBefore, setHours, setMinutes, addHours, startOfMonth } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export function DateTimeRangePicker({
  startDate,
  endDate,
  setStartDate,
  setEndDate
}: {
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setCurrentMonth(startOfMonth(startDate));
  }, [startDate, endDate]);

  const handleSelect = (date: Date | undefined, isStart: boolean) => {
    if (!date) return;
    if (isStart) {
      const newStartDate = setMinutes(setHours(date, tempStartDate.getHours()), tempStartDate.getMinutes());
      setTempStartDate(newStartDate);
      if (tempEndDate && isBefore(tempEndDate, newStartDate)) {
        setTempEndDate(addHours(newStartDate, 1));
      }
    } else {
      const newEndDate = setMinutes(setHours(date, tempEndDate.getHours()), tempEndDate.getMinutes());
      setTempEndDate(newEndDate);
    }
  };

  const handleTimeChange = (time: string, isStart: boolean) => {
    const [hours, minutes] = time.split(':').map(Number);
    if (isStart) {
      setTempStartDate(prev => setMinutes(setHours(prev, hours), minutes));
    } else {
      setTempEndDate(prev => setMinutes(setHours(prev, hours), minutes));
    }
  };

  const moveMonth = (direction: 'left' | 'right') => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, direction === 'left' ? -1 : 1));
  };

  const handleConfirm = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsOpen(false);
  };

  // console.log('startDate', startDate);
  // console.log('tempStartDate', tempStartDate);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !startDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {startDate && endDate ? (
            `${format(startDate, "MMM d, yyyy HH:mm")} - ${format(endDate, "MMM d, yyyy HH:mm")}`
          ) : (
            <span>Pick a date and time range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex-col">
          <div className="flex relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 z-10 -translate-y-1/2"
              onClick={() => moveMonth('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="grid grid-cols-2 gap-4 p-3">
              <div>
                <h3 className="font-semibold mb-2">Start time</h3>
                <Calendar
                  mode="single"
                  selected={tempStartDate}
                  onSelect={(date) => handleSelect(date, true)}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="rounded-md border"
                  disabled={(date) => date < new Date() || (tempEndDate && isAfter(date, tempEndDate))}
                />
                <div className="mt-2">
                  <Select
                    value={format(tempStartDate, "HH:mm")}
                    onValueChange={(value) => handleTimeChange(value, true)}
                  >
                    <SelectTrigger>
                      <SelectValue>{format(tempStartDate, "HH:mm")}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">End time</h3>
                <Calendar
                  mode="single"
                  selected={tempEndDate}
                  onSelect={(date) => handleSelect(date, false)}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="rounded-md border"
                  disabled={(date) => date < tempStartDate}
                />
                <div className="mt-2">
                  <Select
                    value={format(tempEndDate, "HH:mm")}
                    onValueChange={(value) => handleTimeChange(value, false)}
                  >
                    <SelectTrigger>
                      <SelectValue>{format(tempEndDate, "HH:mm")}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 z-10 -translate-y-1/2"
              onClick={() => moveMonth('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-end space-x-2 p-3 border-t">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}