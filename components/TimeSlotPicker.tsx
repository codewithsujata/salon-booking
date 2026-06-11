"use client";

import { TimeSlot } from "@/lib/types";

type Props = {
  slots: TimeSlot[];
  selected: string;
  onSelect: (time: string) => void;
};

export default function TimeSlotPicker({ slots, selected, onSelect }: Props) {
  if (slots.length === 0) {
    return <p className="text-gray-400 text-sm">No slots available for this day.</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.time}
          disabled={!slot.available}
          onClick={() => onSelect(slot.time)}
          className={`py-2 px-1 rounded-lg text-sm font-medium transition border
            ${
              slot.time === selected
                ? "bg-rose-600 text-white border-rose-600"
                : slot.available
                ? "bg-white text-gray-700 border-gray-200 hover:border-rose-400"
                : "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed line-through"
            }`}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}
