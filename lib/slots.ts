import { format, addMinutes, parse, isAfter, isBefore } from "date-fns";
import { BUSINESS_HOURS } from "./services";
import { TimeSlot } from "./types";

export function generateTimeSlots(
  date: string,
  bookedTimes: string[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const openTime = parse(BUSINESS_HOURS.open, "HH:mm", new Date());
  const closeTime = parse(BUSINESS_HOURS.close, "HH:mm", new Date());

  let current = openTime;
  while (isBefore(current, closeTime)) {
    const timeStr = format(current, "HH:mm");
    slots.push({
      time: timeStr,
      available: !bookedTimes.includes(timeStr),
    });
    current = addMinutes(current, BUSINESS_HOURS.interval);
  }

  return slots;
}

export function isDateAvailable(date: Date): boolean {
  return !BUSINESS_HOURS.closedDays.includes(date.getDay());
}
