"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaFileInvoiceDollar, FaUser, FaBuilding, FaCalendarAlt, FaDollarSign, FaSave, FaTimes } from "react-icons/fa";

const BASE_URL = "http://localhost:8000";

interface Client {
  id: string;
  name: string;
}

interface LegalCustomer {
  id: string;
  legal_name: string;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [legalCustomers, setLegalCustomers] = useState<LegalCustomer[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    customer_id: '',
    total: '',
    currency: 'USD',
    date_generated: new Date().toISOString().split('T')[0],
    pdf_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);
    setError("");

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload file to get URL
      const token = localStorage.getItem("token");
      const uploadResponse = await fetch(`${BASE_URL}/api/v1/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const { url } = await uploadResponse.json();
      setFormData(prev => ({ ...prev, pdf_url: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/v1/invoices/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          total: parseFloat(formData.total)
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      router.push("/dashboard/invoices");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/invoices" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4 transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to Invoices
          </Link>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Invoice</h1>
            <p className="text-gray-600">Generate a new invoice for your client.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center mb-6">
              <FaFileInvoiceDollar className="text-indigo-600 mr-3 text-xl" />
              <h2 className="text-xl font-semibold text-gray-900">Invoice Details</h2>
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
                <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Customer *
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="customer_id"
                    id="customer_id"
                    required
                    value={formData.customer_id}
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

              <div>
                <label htmlFor="total" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Amount *
                </label>
                <div className="relative">
                  <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="total"
                    id="total"
                    required
                    min="0"
                    step="0.01"
                    value={formData.total}
                    onChange={handleChange}
                    className="text-gray-900 w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  name="currency"
                  id="currency"
                  required
                  value={formData.currency}
                  onChange={handleChange}
                  className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div>
                <label htmlFor="date_generated" className="block text-sm font-medium text-gray-700 mb-2">
                  Date Generated *
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="date_generated"
                    id="date_generated"
                    required
                    value={formData.date_generated}
                    onChange={handleChange}
                    className="text-gray-900 w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pdf_file" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload PDF
                </label>
                <input
                  type="file"
                  name="pdf_file"
                  id="pdf_file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4
                            file:rounded-xl file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100
                            transition-all"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected file: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard/invoices"
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
              {loading ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
