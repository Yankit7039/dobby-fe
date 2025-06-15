"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = "http://localhost:8000";

export default function NewLegalCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    client_id: "",
    legal_name: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${BASE_URL}/api/v1/legal-customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error("Failed to create legal customer");
      router.push("/dashboard/legal-customers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create legal customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white shadow sm:rounded-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">Add Legal Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black">Client ID</label>
            <input name="client_id" value={form.client_id} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Legal Name</label>
            <input name="legal_name" value={form.legal_name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black" />
          </div>
          {error && <div className="text-red-600">{error}</div>}
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={() => router.push('/dashboard/legal-customers')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
              {loading ? "Adding..." : "Add Legal Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 