"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Appointment, Service, Customer } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"];
const DEFAULT_SERVICE_IMAGE = "/default-service.jpg";

const EMPTY_FORM = { name: "", duration: "", price: "", description: "", image_url: "" };

export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<"appointments" | "services" | "same time" | "customers">("appointments");

  // ── Appointments ──
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const PAGE_SIZE = 50;

  // ── Services ──
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  // ── Customers ──
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerBookings, setCustomerBookings] = useState<Appointment[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const pass = sessionStorage.getItem("admin_pass");
    if (!pass) { router.replace("/admin"); return; }
    loadAppointments();
    loadServices();
    loadCustomers();
  }, []);

  // ── Appointments ──
  async function loadAppointments() {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: "0" });
    if (dateFilter) params.set("date", dateFilter);
    const res = await fetch(`/api/appointments?${params}`);
    const data = await res.json();
    setAppointments(data.appointments || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  useEffect(() => { loadAppointments(); }, [dateFilter]);

  async function loadMore() {
    setLoadingMore(true);
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(appointments.length) });
    if (dateFilter) params.set("date", dateFilter);
    const res = await fetch(`/api/appointments?${params}`);
    const data = await res.json();
    setAppointments((prev) => [...prev, ...(data.appointments || [])]);
    setLoadingMore(false);
  }

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

  // ── Services ──
  async function loadServices() {
    setServicesLoading(true);
    const res = await fetch("/api/services");
    const data = await res.json();
    setServices(data.services || []);
    setServicesLoading(false);
  }

  async function loadCustomers() {
    setCustomersLoading(true);
    const res = await fetch("/api/customers");
    const data = await res.json();
    setCustomers(data.customers || []);
    setCustomersLoading(false);
  }

  async function viewCustomerBookings(customer: Customer) {
    setSelectedCustomer(customer);
    setBookingsLoading(true);
    const res = await fetch(`/api/customers/${encodeURIComponent(customer.phone)}`);
    const data = await res.json();
    setCustomerBookings(data.appointments || []);
    setBookingsLoading(false);
  }

  function openAdd() {
    setEditingService(null);
    setForm(EMPTY_FORM);
    setImagePreview("");
    setShowForm(true);
  }

  function openEdit(s: Service) {
    setEditingService(s);
    setForm({
      name: s.name,
      duration: s.duration ? String(s.duration) : "",
      price: String(s.price),
      description: s.description || "",
      image_url: s.image_url || "",
    });
    setImagePreview(s.image_url || "");
    setShowForm(true);
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // local preview immediately
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/services/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((f) => ({ ...f, image_url: data.url }));
      toast.success("Image uploaded");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setImagePreview("");
      setForm((f) => ({ ...f, image_url: "" }));
    } finally {
      setUploading(false);
    }
  }

  async function saveService(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        duration: form.duration ? Number(form.duration) : null,
        price: Number(form.price),
        description: form.description || null,
        image_url: form.image_url || null,
      };
      const res = editingService
        ? await fetch(`/api/services/${editingService.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      toast.success(editingService ? "Service updated" : "Service added");
      setShowForm(false);
      loadServices();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setSaving(false);
    }
  }

  async function deleteService(id: string, name: string) {
    if (!confirm(`Remove "${name}"? It will be hidden from the booking page.`)) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      toast.success("Service removed");
      setServices((prev) => prev.filter((s) => s.id !== id));
    } else {
      toast.error(data.error || "Failed to remove service");
    }
  }

  // ── Derived ──
  const filtered = appointments.filter((a) => {
    const matchStatus = filter === "all" || a.status === filter;
    const matchSearch = !search || a.client_name.toLowerCase().includes(search.toLowerCase()) || a.client_phone.includes(search);
    const matchService = !serviceFilter || a.service_name === serviceFilter;
    return matchStatus && matchSearch && matchService;
  });

  const counts = {
    all: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  // Group appointments by date+time to find conflicts (excluding cancelled)
  const conflictGroups = Object.values(
    appointments
      .filter((a) => a.status !== "cancelled")
      .reduce<Record<string, Appointment[]>>((acc, a) => {
        const key = `${a.date}__${a.time}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(a);
        return acc;
      }, {})
  ).filter((group) => group.length > 1)
   .sort((a, b) => a[0].date.localeCompare(b[0].date));

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-400">Glamour Salon</p>
          </div>
          <div className="flex gap-3 items-center">
            <a href="/" className="text-sm text-rose-600 hover:underline">View Site</a>
            <button onClick={() => { sessionStorage.clear(); router.push("/admin"); }} className="text-sm text-gray-400 hover:text-gray-600">
              Logout
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 flex gap-1 border-t">
          {(["appointments", "customers", "services", "same time"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition ${
                tab === t ? "border-rose-600 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
              {t === "same time" && conflictGroups.length > 0 && (
                <span className="ml-1.5 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {conflictGroups.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ── APPOINTMENTS TAB ── */}
        {tab === "appointments" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-2xl p-4 text-center transition border-2 ${
                  filter === "all" ? "border-rose-500 bg-white shadow-md" : "bg-white border-transparent shadow-sm hover:border-rose-200"
                }`}
              >
                <div className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1 bg-gray-100 text-gray-600">all</div>
                <div className="text-2xl font-bold text-gray-800">{counts.all}</div>
              </button>
              {(["pending", "confirmed", "completed", "cancelled"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`rounded-2xl p-4 text-center transition border-2 ${
                    filter === s ? "border-rose-500 bg-white shadow-md" : "bg-white border-transparent shadow-sm hover:border-rose-200"
                  }`}
                >
                  <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${STATUS_COLORS[s]}`}>{s}</div>
                  <div className="text-2xl font-bold text-gray-800">{counts[s]}</div>
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-3 shadow-sm mb-4 flex flex-wrap gap-2 items-center">
              <input
                type="text"
                placeholder="Search name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-40 focus:outline-none focus:border-rose-400"
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
              />
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400 bg-white"
              >
                <option value="">All services</option>
                {Array.from(new Set(appointments.map((a) => a.service_name))).sort().map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <button
                onClick={() => { setFilter("all"); setSearch(""); setDateFilter(""); setServiceFilter(""); }}
                className="text-xs text-gray-400 hover:text-rose-600 px-2"
              >
                Clear
              </button>
            </div>

            {loading ? (
              <p className="text-center text-gray-400 py-12">Loading...</p>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-4xl mb-3">📅</p>
                <p className="text-gray-400">No appointments found</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {filtered.map((appt) => (
                    <div
                      key={appt.id}
                      className={`bg-white rounded-2xl shadow-sm border-l-4 ${
                        appt.status === "pending" ? "border-yellow-400" :
                        appt.status === "confirmed" ? "border-blue-400" :
                        appt.status === "completed" ? "border-green-400" :
                        "border-gray-200"
                      }`}
                    >
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-800 text-base">{appt.client_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[appt.status]}`}>
                              {appt.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5 text-sm text-gray-500">
                            <span>📞 {appt.client_phone}</span>
                            {appt.client_email && <span>✉️ {appt.client_email}</span>}
                            <span>✂️ {appt.service_name}</span>
                            <span>📅 {appt.date} · {appt.time.slice(0, 5)}</span>
                          </div>
                          {appt.notes && (
                            <p className="text-xs text-gray-400 mt-1.5 bg-gray-50 rounded-lg px-2 py-1">📝 {appt.notes}</p>
                          )}
                          <p className="text-xs text-gray-300 mt-1">
                            Booked {format(new Date(appt.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0 sm:items-end">
                          <p className="text-xs text-gray-400 font-medium">Change status</p>
                          <div className="flex gap-1.5 flex-wrap sm:flex-col">
                            {STATUS_OPTIONS.filter((s) => s !== appt.status).map((s) => (
                              <button
                                key={s}
                                onClick={() => updateStatus(appt.id, s)}
                                className={`text-xs px-4 py-1.5 rounded-xl font-semibold transition ${STATUS_COLORS[s]} hover:opacity-80`}
                              >
                                {s === "confirmed" ? "✓ Confirm" :
                                 s === "completed" ? "✔ Complete" :
                                 s === "cancelled" ? "✕ Cancel" : "↩ Pending"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {appointments.length < total && (
                  <div className="text-center mt-4">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="bg-white border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition"
                    >
                      {loadingMore ? "Loading..." : `Load more (${total - appointments.length} remaining)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── SERVICES TAB ── */}
        {tab === "services" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">{services.length} active service{services.length !== 1 ? "s" : ""}</p>
              <button onClick={openAdd} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-rose-700 transition">
                + Add Service
              </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl p-3 shadow-sm mb-4">
              <input
                type="text"
                placeholder="Search services..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
              />
            </div>

            {servicesLoading ? (
              <p className="text-center text-gray-400 py-12">Loading services...</p>
            ) : services.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-gray-400">No services yet. Add your first one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services
                  .filter((s) =>
                    !serviceSearch ||
                    s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                    (s.description || "").toLowerCase().includes(serviceSearch.toLowerCase())
                  )
                  .map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <img
                      src={s.image_url || DEFAULT_SERVICE_IMAGE}
                      alt={s.name}
                      className="w-full h-36 object-cover bg-rose-50"
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_SERVICE_IMAGE; }}
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">{s.name}</h4>
                          {s.description && <p className="text-gray-400 text-sm mt-0.5 line-clamp-2">{s.description}</p>}
                          <div className="mt-3 flex items-center gap-3">
                            <span className="text-rose-600 font-bold">₹{s.price}</span>
                            {s.duration && <span className="text-gray-400 text-sm">{s.duration} min</span>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => openEdit(s)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteService(s.id, s.name)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add / Edit modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
                  <h3 className="font-bold text-gray-800 text-lg mb-4">
                    {editingService ? "Edit Service" : "Add Service"}
                  </h3>
                  <form onSubmit={saveService} className="space-y-3">
                    {/* Image upload */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Service Image (optional)</label>
                      <div
                        onClick={() => fileRef.current?.click()}
                        className="relative h-36 rounded-xl border-2 border-dashed border-gray-200 hover:border-rose-400 cursor-pointer overflow-hidden transition bg-gray-50 flex items-center justify-center"
                      >
                        {imagePreview ? (
                          <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <p className="text-2xl mb-1">📷</p>
                            <p className="text-xs text-gray-400">Click to upload image</p>
                          </div>
                        )}
                        {uploading && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <p className="text-xs text-gray-500">Uploading...</p>
                          </div>
                        )}
                      </div>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => { setImagePreview(""); setForm((f) => ({ ...f, image_url: "" })); }}
                          className="text-xs text-red-400 hover:text-red-600 mt-1"
                        >
                          Remove image
                        </button>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>

                    <input
                      required
                      placeholder="Service name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400"
                    />
                    <input
                      placeholder="Description (optional)"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400"
                    />
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Price (₹)</label>
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="500"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Duration (min) — optional</label>
                        <input
                          type="number"
                          min="5"
                          step="5"
                          placeholder="60"
                          value={form.duration}
                          onChange={(e) => setForm({ ...form, duration: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving || uploading}
                        className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 disabled:opacity-40 transition"
                      >
                        {saving ? "Saving..." : editingService ? "Save Changes" : "Add Service"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── SAME TIME TAB ── */}
        {tab === "same time" && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <p className="text-sm text-gray-500">
                {conflictGroups.length === 0
                  ? "No same-time bookings"
                  : `${conflictGroups.length} slot${conflictGroups.length !== 1 ? "s" : ""} with multiple bookings`}
              </p>
            </div>

            {conflictGroups.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-gray-400">No conflicts — all time slots are unique</p>
              </div>
            ) : (
              <div className="space-y-4">
                {conflictGroups.map((group) => (
                  <div key={`${group[0].date}__${group[0].time}`} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Slot header */}
                    <div className="bg-orange-50 border-b border-orange-100 px-4 py-3 flex items-center gap-2">
                      <span className="text-orange-500">⚠️</span>
                      <span className="font-semibold text-orange-700 text-sm">
                        {format(new Date(group[0].date + "T00:00:00"), "d MMMM yyyy")} · {group[0].time.slice(0, 5)}
                      </span>
                      <span className="ml-auto bg-orange-200 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {group.length} bookings
                      </span>
                    </div>
                    {/* Bookings in that slot */}
                    <div className="divide-y divide-gray-50">
                      {group.map((a) => (
                        <div key={a.id} className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 border-l-4 ${
                          a.status === "pending" ? "border-yellow-400" :
                          a.status === "confirmed" ? "border-blue-400" :
                          a.status === "completed" ? "border-green-400" : "border-gray-200"
                        }`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800">{a.client_name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                            </div>
                            <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-0.5">
                              <span>📞 {a.client_phone}</span>
                              <span>✂️ {a.service_name}</span>
                              {a.notes && <span>📝 {a.notes}</span>}
                            </div>
                          </div>
                          <div className="flex gap-1.5 flex-wrap shrink-0">
                            {STATUS_OPTIONS.filter((s) => s !== a.status).map((s) => (
                              <button
                                key={s}
                                onClick={() => updateStatus(a.id, s)}
                                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition ${STATUS_COLORS[s]} hover:opacity-80`}
                              >
                                {s === "confirmed" ? "✓ Confirm" :
                                 s === "completed" ? "✔ Complete" :
                                 s === "cancelled" ? "✕ Cancel" : "↩ Pending"}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── CUSTOMERS TAB ── */}
        {tab === "customers" && (
          <>
            <div className="bg-white rounded-2xl p-3 shadow-sm mb-4 flex gap-3 items-center">
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
              />
              <p className="text-sm text-gray-400 shrink-0">{customers.length} customers</p>
            </div>

            {customersLoading ? (
              <p className="text-center text-gray-400 py-12">Loading...</p>
            ) : customers.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-4xl mb-3">👤</p>
                <p className="text-gray-400">No customers yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {customers
                  .filter((c) =>
                    !customerSearch ||
                    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                    c.phone.includes(customerSearch)
                  )
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => viewCustomerBookings(c)}
                      className="bg-white rounded-2xl p-4 shadow-sm text-left hover:shadow-md hover:border-rose-200 border-2 border-transparent transition"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{c.name}</p>
                          <p className="text-sm text-gray-400">{c.phone}</p>
                        </div>
                      </div>
                      {c.email && <p className="text-xs text-gray-400 mb-2">✉️ {c.email}</p>}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs bg-rose-50 text-rose-600 font-semibold px-2 py-1 rounded-lg">
                          {c.total_bookings} booking{c.total_bookings !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-gray-300">
                          Last: {format(new Date(c.last_booking_at), "d MMM yyyy")}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            )}

            {/* Customer booking history modal */}
            {selectedCustomer && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[85vh] flex flex-col">
                  <div className="p-5 border-b flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg shrink-0">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800">{selectedCustomer.name}</p>
                      <p className="text-sm text-gray-400">{selectedCustomer.phone}{selectedCustomer.email ? ` · ${selectedCustomer.email}` : ""}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedCustomer(null); setCustomerBookings([]); }}
                      className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4 overflow-y-auto flex-1">
                    <p className="text-xs text-gray-400 font-medium mb-3">
                      {selectedCustomer.total_bookings} total booking{selectedCustomer.total_bookings !== 1 ? "s" : ""}
                    </p>
                    {bookingsLoading ? (
                      <p className="text-center text-gray-400 py-8">Loading...</p>
                    ) : customerBookings.length === 0 ? (
                      <p className="text-center text-gray-400 py-8">No bookings found</p>
                    ) : (
                      <div className="space-y-2">
                        {customerBookings.map((appt) => (
                          <div
                            key={appt.id}
                            className={`rounded-xl p-3 border-l-4 bg-gray-50 ${
                              appt.status === "pending" ? "border-yellow-400" :
                              appt.status === "confirmed" ? "border-blue-400" :
                              appt.status === "completed" ? "border-green-400" : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-800 text-sm">{appt.service_name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[appt.status]}`}>
                                {appt.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              📅 {format(new Date(appt.date + "T00:00:00"), "d MMM yyyy")} · {appt.time.slice(0, 5)}
                            </p>
                            {appt.notes && <p className="text-xs text-gray-400 mt-1">📝 {appt.notes}</p>}
                            <p className="text-xs text-gray-300 mt-1">
                              Booked {format(new Date(appt.created_at), "d MMM yyyy, h:mm a")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
