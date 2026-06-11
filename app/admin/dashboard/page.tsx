"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Appointment } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"];

export default function Dashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Simple client-side auth check
    const pass = sessionStorage.getItem("admin_pass");
    if (!pass) {
      router.replace("/admin");
      return;
    }
    loadAppointments();
  }, []);

  async function loadAppointments() {
    setLoading(true);
    const url = dateFilter ? `/api/appointments?date=${dateFilter}` : "/api/appointments";
    const res = await fetch(url);
    const data = await res.json();
    setAppointments(data.appointments || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAppointments();
  }, [dateFilter]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`Status updated to ${status}`);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: status as Appointment["status"] } : a))
      );
    } else {
      toast.error("Failed to update status");
    }
  }

  const filtered = appointments.filter((a) => {
    const matchStatus = filter === "all" || a.status === filter;
    const matchSearch =
      !search ||
      a.client_name.toLowerCase().includes(search.toLowerCase()) ||
      a.client_phone.includes(search);
    return matchStatus && matchSearch;
  });

  const counts = {
    all: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Appointments Dashboard</h1>
            <p className="text-sm text-gray-400">Manage all your bookings</p>
          </div>
          <div className="flex gap-3 items-center">
            <a href="/" className="text-sm text-rose-600 hover:underline">View Site</a>
            <button
              onClick={() => { sessionStorage.clear(); router.push("/admin"); }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {(["pending", "confirmed", "completed", "cancelled"] as const).map((s) => (
            <div key={s} className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${STATUS_COLORS[s]}`}>
                {s}
              </div>
              <div className="text-2xl font-bold text-gray-800">{counts[s]}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:border-rose-400"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
          />
          <div className="flex gap-1">
            {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  filter === s ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s} {s !== "all" && `(${counts[s]})`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-center text-gray-400 py-12">Loading appointments...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-gray-400">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((appt) => (
              <div key={appt.id} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800">{appt.client_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[appt.status]}`}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 space-y-0.5">
                    <p>📞 {appt.client_phone} {appt.client_email && `· ${appt.client_email}`}</p>
                    <p>💆 {appt.service_name}</p>
                    <p>📅 {appt.date} at {appt.time}</p>
                    {appt.notes && <p>📝 {appt.notes}</p>}
                    <p className="text-xs text-gray-300">Booked {format(new Date(appt.created_at), "MMM d, h:mm a")}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_OPTIONS.filter((s) => s !== appt.status).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(appt.id, s)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition hover:opacity-80 ${STATUS_COLORS[s]} border-transparent`}
                    >
                      → {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
