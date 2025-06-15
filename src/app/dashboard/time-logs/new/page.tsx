"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = "http://localhost:8000";

export default function NewTimeLogPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    user_id: "",
    client_id: "",
    legal_customers_id: "",
    billable_hours: 0,
    task_description: "",
    status: "completed",
    amount: 0,
    date: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${BASE_URL}/api/v1/work-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error("Failed to create time log");
      router.push("/dashboard/time-logs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create time log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white shadow sm:rounded-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">Add Time Log</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black">User ID</label>
            <input name="user_id" value={form.user_id} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Client ID</label>
            <input name="client_id" value={form.client_id} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Legal Customer ID</label>
            <input name="legal_customers_id" value={form.legal_customers_id} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Billable Hours</label>
            <input name="billable_hours" type="number" step="0.01" value={form.billable_hours} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Task Description</label>
            <textarea name="task_description" value={form.task_description} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black">
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Amount</label>
            <input name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black" />
          </div>
          {error && <div className="text-red-600">{error}</div>}
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={() => router.push('/dashboard/time-logs')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
              {loading ? "Adding..." : "Add Time Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 