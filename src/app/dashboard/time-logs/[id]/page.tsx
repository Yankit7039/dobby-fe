"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = "http://localhost:8000";

interface TimeLog {
  id: string;
  user_id: string;
  client_id: string;
  legal_customers_id: string;
  billable_hours: number;
  task_description: string;
  status: string;
  amount: number;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export default function TimeLogDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [log, setLog] = useState<TimeLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedLog, setEditedLog] = useState<TimeLog | null>(null);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/work-logs/${id}`);
        if (!response.ok) throw new Error("Failed to fetch time log");
        const data = await response.json();
        setLog(data);
        setEditedLog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch time log");
      } finally {
        setLoading(false);
      }
    };
    fetchLog();
  }, [id]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setEditedLog(log);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editedLog) return;
    const { name, value, type } = e.target;
    setEditedLog(prev => prev ? { ...prev, [name]: type === "number" ? Number(value) : value } : prev);
  };
  const handleSave = async () => {
    if (!editedLog) return;
    try {
      const response = await fetch(`${BASE_URL}/api/v1/work-logs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedLog)
      });
      if (!response.ok) throw new Error("Failed to update time log");
      const updated = await response.json();
      setLog(updated);
      setEditedLog(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update time log");
    }
  };
  // const handleDelete = async () => {
  //   if (!confirm('Are you sure you want to delete this time log?')) return;
  //   try {
  //     const response = await fetch(`${BASE_URL}/api/v1/work-logs/${id}`, { method: 'DELETE' });
  //     if (!response.ok) throw new Error('Failed to delete time log');
  //     router.push('/dashboard/time-logs');
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to delete time log');
  //   }
  // };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!log) return <div className="p-6">No data found.</div>;

  const displayLog = isEditing ? editedLog : log;
  if (!displayLog) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-black">Time Log Details</h2>
      <div className="bg-white shadow sm:rounded-md p-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID</label>
            <input name="user_id" value={displayLog.user_id} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Client ID</label>
            <input name="client_id" value={displayLog.client_id} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Legal Customer ID</label>
            <input name="legal_customers_id" value={displayLog.legal_customers_id} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Billable Hours</label>
            <input name="billable_hours" type="number" step="0.01" value={displayLog.billable_hours || 0} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Task Description</label>
            <textarea name="task_description" value={displayLog.task_description} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select name="status" value={displayLog.status} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black disabled:bg-gray-100">
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input name="amount" type="number" step="0.01" value={displayLog.amount} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input name="date" type="date" value={displayLog.date} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black disabled:bg-gray-100" />
          </div>
          {/* {displayLog.created_at && <div><span className="font-semibold">Created At:</span> {displayLog.created_at}</div>}
          {displayLog.updated_at && <div><span className="font-semibold">Updated At:</span> {displayLog.updated_at}</div>} */}
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