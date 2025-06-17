
"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaClock, FaEdit, FaSave, FaTimes, FaArrowLeft, FaDollarSign, FaCalendarAlt, FaUser, FaTasks } from "react-icons/fa";

const BASE_URL = "http://localhost:8000";

interface TimeLogDetails {
  id: string;
  user_id: string;
  client_id: string;
  legal_customers_id: string;
  billable_hours: number | null;
  task_description: string;
  status: string;
  amount: number;
  date: string;
  client_name?: string;
  customer_name?: string;
  created_at: string;
  updated_at: string;
}

export default function TimeLogDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [timeLog, setTimeLog] = useState<TimeLogDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTimeLog, setEditedTimeLog] = useState<TimeLogDetails | null>(null);

  useEffect(() => {
    const fetchTimeLog = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/work-logs/${id}`);
        if (!response.ok) throw new Error("Failed to fetch time log");
        const data = await response.json();
        setTimeLog(data);
        setEditedTimeLog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch time log");
      } finally {
        setLoading(false);
      }
    };
    fetchTimeLog();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTimeLog(timeLog);
  };

  const handleSave = async () => {
    if (!editedTimeLog) return;

    try {
      const response = await fetch(`${BASE_URL}/api/v1/time-logs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedTimeLog),
      });

      if (!response.ok) throw new Error("Failed to update time log");

      const updatedTimeLog = await response.json();
      setTimeLog(updatedTimeLog);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update time log");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editedTimeLog) return;
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseFloat(value) || 0 : value;
    setEditedTimeLog(prev => prev ? { ...prev, [name]: finalValue } : null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FaTimes className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-800">Error</h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayTimeLog = isEditing ? editedTimeLog : timeLog;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Time Log Details</h1>
            <p className="text-gray-500 mt-1">Log #{displayTimeLog?.id?.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaEdit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaTimes className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaSave className="w-4 h-4" />
                <span>Save</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Time Log Information */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaClock className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Time Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Billable Hours</label>
              {isEditing ? (
                <input
                  type="number"
                  name="billable_hours"
                  value={displayTimeLog?.billable_hours || 0}
                  onChange={handleChange}
                  step="0.25"
                  className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-semibold text-xl">{displayTimeLog?.billable_hours || 0} hours</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              {isEditing ? (
                <input
                  type="date"
                  name="date"
                  value={displayTimeLog?.date || ''}
                  onChange={handleChange}
                  className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{displayTimeLog?.date ? new Date(displayTimeLog.date).toLocaleDateString() : 'N/A'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              {isEditing ? (
                <select
                  name="status"
                  value={displayTimeLog?.status || 'pending'}
                  onChange={handleChange}
                  className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="billed">Billed</option>
                  <option value="rejected">Rejected</option>
                </select>
              ) : (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  displayTimeLog?.status === 'approved' ? 'bg-green-100 text-green-800' :
                  displayTimeLog?.status === 'billed' ? 'bg-blue-100 text-blue-800' :
                  displayTimeLog?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {displayTimeLog?.status || 'Pending'}
                </span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              {isEditing ? (
                <input
                  type="number"
                  name="amount"
                  value={displayTimeLog?.amount || 0}
                  onChange={handleChange}
                  step="0.01"
                  className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-semibold">${displayTimeLog?.amount}</p>
              )}
            </div>
          </div>
        </div>

        {/* Client & Customer Information */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaUser className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Client & Customer</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <p className="text-gray-900 font-medium">{displayTimeLog?.client_name || displayTimeLog?.client_id}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Legal Customer</label>
              <p className="text-gray-900">{displayTimeLog?.customer_name || displayTimeLog?.legal_customers_id}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">{displayTimeLog?.user_id}</p>
            </div>
          </div>
        </div>

        {/* Task Description */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FaTasks className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Task Description</h2>
          </div>
          
          <div>
            {isEditing ? (
              <textarea
                name="task_description"
                value={displayTimeLog?.task_description || ''}
                onChange={handleChange}
                rows={4}
                className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the work performed..."
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{displayTimeLog?.task_description || 'No description provided'}</p>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FaCalendarAlt className="w-5 h-5 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Metadata</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Log ID</label>
              <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">{displayTimeLog?.id}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
              <p className="text-gray-900">{displayTimeLog?.created_at ? new Date(displayTimeLog.created_at).toLocaleString() : 'N/A'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
              <p className="text-gray-900">{displayTimeLog?.updated_at ? new Date(displayTimeLog.updated_at).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
