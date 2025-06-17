
"use client";

import { useState, useEffect } from "react";
import { LegalCustomer, LegalCustomersResponse } from '@/types/dashboard';
import Link from 'next/link';
import { FaPlus, FaDownload, FaEye, FaTrash, FaFilter, FaSort, FaSpinner, FaUsers } from 'react-icons/fa';

const BASE_URL = "http://localhost:8000";

export default function LegalCustomersPage() {
  const [legalCustomers, setLegalCustomers] = useState<LegalCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'legal_name' | 'client_id' | 'created_at'>('legal_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLegalCustomers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/legal-customers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data: LegalCustomersResponse = await response.json();
        setLegalCustomers(data.legal_customers);
      } catch (err) {
        setError('Failed to fetch legal customers');
        console.error('Error fetching legal customers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLegalCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this legal customer?')) return;
    setDeletingId(id);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/legal-customers/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete legal customer');
      setLegalCustomers(prev => prev.filter((customer: LegalCustomer) => customer.id !== id));
      setSelected(prev => prev.filter(cid => cid !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete legal customer');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter and sort logic
  const filteredCustomers = legalCustomers.filter(cust =>
    cust.legal_name?.toLowerCase().includes(filter.toLowerCase()) ||
    cust.client_id?.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aVal = '', bVal = '';
    if (sortBy === 'legal_name') {
      aVal = a.legal_name?.toLowerCase() ?? '';
      bVal = b.legal_name?.toLowerCase() ?? '';
    } else if (sortBy === 'client_id') {
      aVal = a.client_id?.toLowerCase() ?? '';
      bVal = b.client_id?.toLowerCase() ?? '';
    } else if (sortBy === 'created_at') {
      aVal = a.created_at ?? '';
      bVal = b.created_at ?? '';
    }
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Selection logic
  const handleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
      setSelectAll(false);
    } else {
      setSelected(sortedCustomers.map(c => c.id));
      setSelectAll(true);
    }
  };

  const handleExport = () => {
    const exportData = sortedCustomers.filter(c => selected.includes(c.id));
    const csvContent = [
      ['ID', 'Legal Name', 'Client ID', 'Address', 'Created At', 'Updated At'],
      ...exportData.map(c => [
        c.id,
        c.legal_name,
        c.client_id,
        c.address,
        c.created_at,
        c.updated_at
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'legal_customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading legal customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading legal customers</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal Customers</h1>
          <p className="text-gray-600">Manage your legal customer database</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6 justify-end">
              <button
                onClick={handleExport}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 flex items-center gap-2 transition-colors"
              >
                <FaDownload className="text-sm" />
                Export CSV
              </button>
              <Link href="/dashboard/legal-customers/new">
                <button className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 flex items-center gap-2 transition-colors">
                  <FaPlus className="text-sm" />
                  Add Customer
                </button>
              </Link>
            </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search by name or client ID..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 min-w-[280px]"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              >
                <option value="legal_name">Sort by Legal Name</option>
                <option value="client_id">Sort by Client ID</option>
                <option value="created_at">Sort by Created Date</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 flex items-center gap-2"
                title="Toggle sort order"
              >
                <FaSort className="text-sm" />
                {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {sortedCustomers.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {sortedCustomers.length} of {legalCustomers.length} legal customers
              {selected.length > 0 && ` • ${selected.length} selected`}
            </p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Legal Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(customer.id)}
                        onChange={() => handleSelect(customer.id)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{customer.legal_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{customer.client_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 max-w-xs truncate">{customer.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{new Date(customer.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/dashboard/legal-customers/${customer.id}`}>
                          <button className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors">
                            {/* <FaEye className="text-sm" /> */}
                            View Details
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(customer.id)} 
                          disabled={deletingId === customer.id} 
                          className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          {deletingId === customer.id ? (
                            <FaSpinner className="text-sm animate-spin" />
                          ) : (
                            <FaTrash className="text-sm" />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {sortedCustomers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaUsers className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No legal customers found</h3>
            <p className="text-gray-500 mb-6">
              {filter ? 'Try adjusting your search criteria.' : 'Get started by adding your first legal customer.'}
            </p>
            {!filter && (
              <Link href="/dashboard/legal-customers/new">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto transition-colors">
                  <FaPlus className="text-sm" />
                  Add Legal Customer
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
