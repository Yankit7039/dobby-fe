"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = "http://localhost:8000";

interface LegalCustomer {
  id: string;
  client_id: string;
  legal_name: string;
  address: string;
  created_at?: string;
  updated_at?: string;
}

export default function LegalCustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [customer, setCustomer] = useState<LegalCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<LegalCustomer | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/legal-customers/${id}`);
        if (!response.ok) throw new Error("Failed to fetch legal customer");
        const data = await response.json();
        setCustomer(data);
        setEditedCustomer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch legal customer");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setEditedCustomer(customer);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedCustomer) return;
    const { name, value } = e.target;
    setEditedCustomer(prev => prev ? { ...prev, [name]: value } : prev);
  };
  const handleSave = async () => {
    if (!editedCustomer) return;
    try {
      const response = await fetch(`${BASE_URL}/api/v1/legal-customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedCustomer)
      });
      if (!response.ok) throw new Error("Failed to update legal customer");
      const updated = await response.json();
      setCustomer(updated);
      setEditedCustomer(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update legal customer");
    }
  };
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this legal customer?')) return;
    try {
      const response = await fetch(`${BASE_URL}/api/v1/legal-customers/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete legal customer');
      router.push('/dashboard/legal-customers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete legal customer');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!customer) return <div className="p-6">No data found.</div>;

  const displayCustomer = isEditing ? editedCustomer : customer;
  if (!displayCustomer) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-black">Legal Customer Details</h2>
      <div className="bg-white shadow sm:rounded-md p-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Client ID</label>
            <input name="client_id" value={displayCustomer.client_id} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Legal Name</label>
            <input name="legal_name" value={displayCustomer.legal_name} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea name="address" value={displayCustomer.address} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black disabled:bg-gray-100" />
          </div>
          {/* {displayCustomer.created_at && <div><span className="font-semibold">Created At:</span> {displayCustomer.created_at}</div>}
          {displayCustomer.updated_at && <div><span className="font-semibold">Updated At:</span> {displayCustomer.updated_at}</div>} */}
        </div>
        <div className="mt-6 flex gap-2">
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Back</button>
          {isEditing ? (
            <>
              <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Save</button>
            </>
          ) : (
            <button onClick={handleEdit} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Edit</button>
          )}
          {/* <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">Delete</button> */}
        </div>
        {error && <div className="mt-2 text-red-600">{error}</div>}
      </div>
    </div>
  );
} 