"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaClock, FaCalendarAlt, FaFileAlt, FaPlay, FaSave, FaTimes, FaUser, FaDollarSign, FaStopwatch, FaBuilding } from "react-icons/fa";
import { TimeLog } from '@/types/dashboard';

const BASE_URL = "http://localhost:8000";

interface Client {
  id: string;
  name: string;
}

interface LegalCustomer {
  id: string;
  legal_name: string;
}

export default function NewTimeLogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [legalCustomers, setLegalCustomers] = useState<LegalCustomer[]>([]);
  const [formData, setFormData] = useState({
    user_id: '60f1b2b3b3b3b3b3b3b3b3b3', // This should come from auth context
    client_id: '',
    legal_customers_id: '',
    billable_hours: '',
    task_description: '',
    status: 'completed',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, legalCustomersRes] = await Promise.all([
          fetch(`${BASE_URL}/api/v1/clients`),
          fetch(`${BASE_URL}/api/v1/legal-customers`)
        ]);

        const [clientsData, legalCustomersData] = await Promise.all([
          clientsRes.json(),
          legalCustomersRes.json()
        ]);

        setClients(clientsData.clients || []);
        setLegalCustomers(legalCustomersData.legal_customers || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/api/v1/work-logs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          billable_hours: parseFloat(formData.billable_hours),
          amount: parseFloat(formData.amount)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create time log');
      }

      router.push('/dashboard/time-logs');
    } catch (error) {
      console.error('Error creating time log:', error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/time-logs" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4 transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to Time Logs
          </Link>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Log Work Time</h1>
            <p className="text-gray-600">Track your work hours and generate accurate billing records.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center mb-6">
              <FaFileAlt className="text-indigo-600 mr-3 text-xl" />
              <h2 className="text-xl font-semibold text-gray-900">Project Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="client_id"
                    id="client_id"
                    required
                    value={formData.client_id}
                    onChange={handleChange}
                    className="text-gray-900 w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="legal_customers_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Customer *
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="legal_customers_id"
                    id="legal_customers_id"
                    required
                    value={formData.legal_customers_id}
                    onChange={handleChange}
                    className="text-gray-900 w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                  >
                    <option value="">Select a legal customer</option>
                    {legalCustomers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.legal_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="task_description" className="block text-sm font-medium text-gray-700 mb-2">
                  Task Description *
                </label>
                <textarea
                  name="task_description"
                  id="task_description"
                  rows={4}
                  required
                  value={formData.task_description}
                  onChange={handleChange}
                  className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                  placeholder="Describe the task you worked on..."
                />
              </div>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center mb-6">
              <FaClock className="text-indigo-600 mr-3 text-xl" />
              <h2 className="text-xl font-semibold text-gray-900">Time Tracking</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label htmlFor="billable_hours" className="block text-sm font-medium text-gray-700 mb-2">
                  Billable Hours *
                </label>
                <input
                  type="number"
                  name="billable_hours"
                  id="billable_hours"
                  required
                  value={formData.billable_hours}
                  onChange={handleChange}
                  className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  required
                  value={formData.amount}
                  onChange={handleChange}
                  className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  id="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                >
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard/time-logs"
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
            >
              <FaTimes className="mr-2" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg"
            >
              <FaSave className="mr-2" />
              {loading ? "Creating..." : "Create Time Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
