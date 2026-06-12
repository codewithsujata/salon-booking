"use client";

import { TimeSlot } from "@/lib/types";

type Props = {
  slots: TimeSlot[];
  selected: string;
  onSelect: (time: string) => void;
};

export default function TimeSlotPicker({ slots, selected, onSelect }: Props) {
  if (slots.length === 0) {
    return <p className="text-white/30 text-sm">No slots available for this day.</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.time}
          disabled={!slot.available}
          onClick={() => onSelect(slot.time)}
          className={`py-3 text-sm font-medium tracking-wide transition border ${
            slot.time === selected
              ? "bg-[#C9A96E] text-[#0f0f13] border-[#C9A96E]"
              : slot.available
              ? "bg-[#1e1e26] text-white border-white/20 hover:border-[#C9A96E]/70 hover:text-white"
              : "bg-[#16161d] text-white/30 border-white/8 cursor-not-allowed line-through"
          }`}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}
