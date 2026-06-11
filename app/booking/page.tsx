"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, isSunday } from "date-fns";
import toast from "react-hot-toast";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import { DEFAULT_SERVICES } from "@/lib/services";
import { generateTimeSlots } from "@/lib/slots";
import { TimeSlot } from "@/lib/types";

export default function BookingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Generate next 14 available dates (excluding Sundays)
  const availableDates = Array.from({ length: 21 }, (_, i) => addDays(new Date(), i + 1))
    .filter((d) => !isSunday(d))
    .slice(0, 14);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedTime("");
    fetch(`/api/appointments/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const service = DEFAULT_SERVICES.find((s) => s.id === selectedService);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          service_id: selectedService,
          service_name: service?.name,
          date: selectedDate,
          time: selectedTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      toast.success("Appointment booked! We'll confirm shortly.");
      router.push(`/booking/success?name=${encodeURIComponent(form.client_name)}&date=${selectedDate}&time=${selectedTime}&service=${encodeURIComponent(service?.name || "")}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to book");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-rose-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/" className="text-gray-400 hover:text-gray-600">←</a>
          <h1 className="text-xl font-bold text-rose-600">Book Appointment</h1>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex gap-2 mb-8">
          {["Service", "Date & Time", "Your Details"].map((label, i) => (
            <div key={label} className="flex-1 text-center">
              <div
                className={`h-1.5 rounded-full mb-1 ${
                  step > i + 1 ? "bg-rose-600" : step === i + 1 ? "bg-rose-400" : "bg-gray-200"
                }`}
              />
              <span className={`text-xs ${step === i + 1 ? "text-rose-600 font-medium" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* Step 1: Service */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose a Service</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEFAULT_SERVICES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s.id); setStep(2); }}
                  className={`text-left p-4 rounded-2xl border-2 transition bg-white hover:border-rose-400 ${
                    selectedService === s.id ? "border-rose-600" : "border-gray-100"
                  }`}
                >
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="font-semibold text-gray-800">{s.name}</div>
                  <div className="text-sm text-gray-400 mt-0.5">{s.description}</div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-rose-600 font-bold">${s.price}</span>
                    <span className="text-gray-400 text-sm">{s.duration} min</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="text-sm text-gray-400 mb-4 hover:text-gray-600">
              ← Back
            </button>
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <p className="text-sm text-gray-500">Selected service</p>
              <p className="font-semibold text-gray-800">{service?.icon} {service?.name} — ${service?.price}</p>
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-3">Pick a Date</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {availableDates.map((date) => {
                const str = format(date, "yyyy-MM-dd");
                return (
                  <button
                    key={str}
                    onClick={() => setSelectedDate(str)}
                    className={`flex-shrink-0 w-14 py-2 rounded-xl border text-center transition ${
                      selectedDate === str
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-rose-400"
                    }`}
                  >
                    <div className="text-xs">{format(date, "EEE")}</div>
                    <div className="font-bold text-lg">{format(date, "d")}</div>
                    <div className="text-xs">{format(date, "MMM")}</div>
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Pick a Time</h2>
                {loadingSlots ? (
                  <p className="text-gray-400 text-sm">Loading slots...</p>
                ) : (
                  <TimeSlotPicker
                    slots={slots}
                    selected={selectedTime}
                    onSelect={setSelectedTime}
                  />
                )}
              </>
            )}

            <button
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(3)}
              className="mt-6 w-full bg-rose-600 text-white py-3 rounded-full font-semibold disabled:opacity-40 hover:bg-rose-700 transition"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 3: Client Details */}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <button type="button" onClick={() => setStep(2)} className="text-sm text-gray-400 mb-4 hover:text-gray-600">
              ← Back
            </button>

            {/* Summary */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 space-y-1">
              <p className="text-sm text-gray-500">Booking summary</p>
              <p className="font-semibold text-gray-800">{service?.icon} {service?.name}</p>
              <p className="text-sm text-gray-500">{selectedDate} at {selectedTime}</p>
              <p className="text-rose-600 font-bold">${service?.price} · {service?.duration} min</p>
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Details</h2>
            <div className="space-y-3">
              <input
                required
                placeholder="Full Name"
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400"
              />
              <input
                required
                type="tel"
                placeholder="Phone Number"
                value={form.client_phone}
                onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={form.client_email}
                onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400"
              />
              <textarea
                placeholder="Any notes or requests? (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !form.client_name || !form.client_phone}
              className="mt-6 w-full bg-rose-600 text-white py-3 rounded-full font-semibold disabled:opacity-40 hover:bg-rose-700 transition"
            >
              {submitting ? "Booking..." : "Confirm Booking"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
