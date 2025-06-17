"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaFileInvoiceDollar, FaEdit, FaSave, FaTimes, FaArrowLeft, FaDollarSign, FaCalendarAlt, FaUser, FaDownload } from "react-icons/fa";

const BASE_URL = "http://localhost:8000";

interface InvoiceDetails {
  id: string;
  client_id: string;
  client_name?: string;
  customer_id: string;
  customer_name?: string;
  total: number;
  currency: string;
  date_generated: string;
  pdf_url: string;
  status?: string;
  terms?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState<InvoiceDetails | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/invoices/${id}`);
        if (!response.ok) throw new Error("Failed to fetch invoice");
        const data = await response.json();
        setInvoice(data);
        setEditedInvoice(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch invoice");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInvoice(invoice);
  };

  const handleSave = async () => {
    if (!editedInvoice) return;

    try {
      const response = await fetch(`${BASE_URL}/api/v1/invoices/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedInvoice),
      });

      if (!response.ok) throw new Error("Failed to update invoice");

      const updatedInvoice = await response.json();
      setInvoice(updatedInvoice);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update invoice");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editedInvoice) return;
    const { name, value } = e.target;
    setEditedInvoice(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleDownload = () => {
    if (invoice?.pdf_url) {
      window.open(invoice.pdf_url, '_blank');
    }
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

  const displayInvoice = isEditing ? editedInvoice : invoice;

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
            <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
            <p className="text-gray-500 mt-1">Invoice #{displayInvoice?.id?.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {displayInvoice?.pdf_url && (
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaDownload className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          )}
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
        {/* Invoice Information */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaFileInvoiceDollar className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Invoice Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <p className="text-gray-900 font-medium">{displayInvoice?.client_name || displayInvoice?.client_id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
              <p className="text-gray-900">{displayInvoice?.customer_name || displayInvoice?.customer_id}</p>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              {isEditing ? (
                <select
                  name="status"
                  value={displayInvoice?.status || 'pending'}
                  onChange={handleChange}
                  className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              ) : (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  displayInvoice?.status === 'paid' ? 'bg-green-100 text-green-800' :
                  displayInvoice?.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  displayInvoice?.status === 'overdue' ? 'bg-red-100 text-red-800' :
                  displayInvoice?.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {displayInvoice?.status || 'Pending'}
                </span>
              )}
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Generated</label>
              <p className="text-gray-900">{displayInvoice?.date_generated ? new Date(displayInvoice.date_generated).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaDollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Financial Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
              {isEditing ? (
                <input
                  type="number"
                  name="total"
                  value={displayInvoice?.total || 0}
                  onChange={handleChange}
                  step="0.01"
                  className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-semibold text-xl">${displayInvoice?.total} {displayInvoice?.currency}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              {isEditing ? (
                <input
                  type="text"
                  name="currency"
                  value={displayInvoice?.currency || ''}
                  onChange={handleChange}
                  className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{displayInvoice?.currency}</p>
              )}
            </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice ID</label>
              <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">{displayInvoice?.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
              <p className="text-gray-900">{displayInvoice?.created_at ? new Date(displayInvoice.created_at).toLocaleString() : 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
              <p className="text-gray-900">{displayInvoice?.updated_at ? new Date(displayInvoice.updated_at).toLocaleString() : 'N/A'}</p>
            </div>

            {displayInvoice?.pdf_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PDF URL</label>
                <p className="text-blue-600 hover:text-blue-800 cursor-pointer truncate" onClick={handleDownload}>
                  {displayInvoice.pdf_url}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}