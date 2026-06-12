"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSunday, isBefore, startOfDay, getDay } from "date-fns";
import toast from "react-hot-toast";
import Image from "next/image";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import { TimeSlot, Service } from "@/lib/types";

const DEFAULT_SERVICE_IMAGE = "/default-service.jpg";

export default function BookingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [form, setForm] = useState({ client_name: "", client_phone: "", client_email: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const today = startOfDay(new Date());

  // Build calendar days for current month view
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  // Pad start with empty slots so Mon=0, Tue=1 ... Sun=6
  const startPad = (getDay(monthStart) + 6) % 7; // make Monday first

  useEffect(() => {
    fetch("/api/services").then((r) => r.json()).then((data) => setServices(data.services || []));
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedTime("");
    fetch(`/api/appointments/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const service = services.find((s) => s.id === selectedService);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, service_id: selectedService, service_name: service?.name, date: selectedDate, time: selectedTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      toast.success("Appointment booked!");
      router.push(`/booking/success?name=${encodeURIComponent(form.client_name)}&date=${selectedDate}&time=${selectedTime}&service=${encodeURIComponent(service?.name || "")}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to book");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full bg-[#1e1e26] border border-white/20 text-white placeholder-white/50 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A96E] transition";

  return (
    <main className="min-h-screen bg-[#0f0f13] text-white">
      {/* Header */}
      <header className="bg-[#0f0f13]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <a href="/" className="text-white/60 hover:text-white transition text-lg leading-none">←</a>
          <span className="font-display text-lg">
            <span className="text-white">Glamour</span>
            <span className="text-[#C9A96E]"> Salon</span>
          </span>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-6 pt-8">
        <div className="flex gap-1 mb-8">
          {["Service", "Date & Time", "Your Details"].map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-0.5 mb-2 transition-all ${step > i + 1 ? "bg-[#C9A96E]" : step === i + 1 ? "bg-[#C9A96E]" : "bg-white/20"}`} />
              <span className={`text-xs tracking-wider uppercase ${step === i + 1 ? "text-[#C9A96E]" : step > i + 1 ? "text-white/70" : "text-white/40"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-16">

        {/* Step 1: Service */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-2xl text-white mb-6">Choose a Service</h2>
            {services.length === 0 && (
              <p className="text-white/50 text-sm text-center py-12">Loading services...</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s.id); setStep(2); }}
                  className={`text-left overflow-hidden border transition-all duration-200 bg-[#16161d] ${
                    selectedService === s.id ? "border-[#C9A96E]" : "border-white/15 hover:border-[#C9A96E]/60"
                  }`}
                >
                  <div className="relative h-36 w-full overflow-hidden">
                    <Image src={s.image_url || DEFAULT_SERVICE_IMAGE} alt={s.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#16161d] via-[#16161d]/30 to-transparent" />
                  </div>
                  <div className="p-4">
                    <div className="font-display text-base text-white">{s.name}</div>
                    {s.description && <div className="text-white/65 text-xs mt-1">{s.description}</div>}
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-[#C9A96E] font-semibold">₹{s.price}</span>
                      {s.duration && <span className="text-white/55 text-xs tracking-wider">{s.duration} MIN</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="text-white/60 hover:text-white text-sm mb-6 transition">
              ← Back
            </button>

            {/* Selected service chip */}
            <div className="bg-[#16161d] border border-white/15 p-3 flex items-center gap-3 mb-8">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden">
                <Image src={service?.image_url || DEFAULT_SERVICE_IMAGE} alt={service?.name || ""} fill className="object-cover" />
              </div>
              <div>
                <p className="text-[#C9A96E] text-sm font-medium">{service?.name}</p>
                <p className="text-white/60 text-xs mt-0.5">₹{service?.price}{service?.duration ? ` · ${service.duration} min` : ""}</p>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-[#16161d] border border-white/10 p-4 mb-8">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCalendarMonth((m) => subMonths(m, 1))}
                  disabled={isBefore(endOfMonth(subMonths(calendarMonth, 1)), today)}
                  className="text-white/50 hover:text-white disabled:opacity-20 transition px-2 py-1 text-lg"
                >
                  ‹
                </button>
                <span className="text-white font-medium text-sm tracking-widest uppercase">
                  {format(calendarMonth, "MMMM yyyy")}
                </span>
                <button
                  onClick={() => setCalendarMonth((m) => addMonths(m, 1))}
                  className="text-white/50 hover:text-white transition px-2 py-1 text-lg"
                >
                  ›
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 mb-2">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                  <div key={d} className="text-center text-xs text-white/30 py-1">{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startPad }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {allDays.map((date) => {
                  const str = format(date, "yyyy-MM-dd");
                  const isPast = isBefore(date, today);
                  const isSun = isSunday(date);
                  const isDisabled = isPast || isSun;
                  const isSelected = selectedDate === str;

                  return (
                    <button
                      key={str}
                      disabled={isDisabled}
                      onClick={() => setSelectedDate(str)}
                      className={`aspect-square flex items-center justify-center text-sm rounded-sm transition ${
                        isSelected
                          ? "bg-[#C9A96E] text-[#0f0f13] font-bold"
                          : isDisabled
                          ? "text-white/15 cursor-not-allowed"
                          : "text-white hover:bg-[#C9A96E]/20 hover:text-[#C9A96E]"
                      }`}
                    >
                      {format(date, "d")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <>
                <h2 className="font-display text-xl text-white mb-4">
                  {format(new Date(selectedDate + "T00:00:00"), "EEEE, d MMMM")}
                </h2>
                {loadingSlots ? (
                  <p className="text-white/60 text-sm">Loading...</p>
                ) : (
                  <TimeSlotPicker slots={slots} selected={selectedTime} onSelect={setSelectedTime} />
                )}
              </>
            )}

            <button
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(3)}
              className="mt-8 w-full bg-[#C9A96E] text-[#0f0f13] py-4 text-sm font-semibold tracking-widest uppercase disabled:opacity-30 hover:bg-[#E8D5B0] transition"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <button type="button" onClick={() => setStep(2)} className="text-white/60 hover:text-white text-sm mb-6 transition">
              ← Back
            </button>

            {/* Summary */}
            <div className="bg-[#16161d] border border-[#C9A96E]/30 p-4 mb-8">
              <p className="text-[#C9A96E] text-xs tracking-widest uppercase mb-3">Booking Summary</p>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden">
                  <Image src={service?.image_url || DEFAULT_SERVICE_IMAGE} alt={service?.name || ""} fill className="object-cover" />
                </div>
                <div>
                  <p className="font-display text-white text-base">{service?.name}</p>
                  <p className="text-white/70 text-sm mt-0.5">{format(new Date(selectedDate + "T00:00:00"), "d MMMM yyyy")} at {selectedTime}</p>
                  <p className="text-[#C9A96E] text-sm font-semibold mt-0.5">
                    ₹{service?.price}{service?.duration ? ` · ${service.duration} min` : ""}
                  </p>
                </div>
              </div>
            </div>

            <h2 className="font-display text-2xl text-white mb-5">Your Details</h2>
            <div className="space-y-3">
              <input required placeholder="Full Name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className={inputClass} />
              <input required type="tel" placeholder="Phone Number" value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} className={inputClass} />
              <input type="email" placeholder="Email (optional)" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} className={inputClass} />
              <textarea placeholder="Notes or requests (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
            </div>

            <button
              type="submit"
              disabled={submitting || !form.client_name || !form.client_phone}
              className="mt-6 w-full bg-[#C9A96E] text-[#0f0f13] py-4 text-sm font-semibold tracking-widest uppercase disabled:opacity-30 hover:bg-[#E8D5B0] transition"
            >
              {submitting ? "Confirming..." : "Confirm Booking"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

