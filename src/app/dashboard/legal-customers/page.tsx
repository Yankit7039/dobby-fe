'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const BASE_URL = "http://localhost:8000";

function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csvRows = [
    keys.join(','),
    ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))
  ];
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type SortableLegalCustomerField = 'legal_name' | 'client_id' | 'created_at';

export default function LegalCustomersPage() {
  const [legalCustomers, setLegalCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortableLegalCustomerField>('legal_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchLegalCustomers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/v1/legal-customers`);
        if (!response.ok) throw new Error('Failed to fetch legal customers');
        const data = await response.json();
        setLegalCustomers(Array.isArray(data.legal_customers) ? data.legal_customers : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch legal customers');
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
      setLegalCustomers(prev => prev.filter((c: any) => c.id !== id));
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
    exportToCSV(exportData.length ? exportData : sortedCustomers, 'legal_customers.csv');
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Filter by legal name or client id"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-black"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortableLegalCustomerField)}
            className="border border-gray-300 rounded-md px-2 py-2 text-black"
          >
            <option value="legal_name">Legal Name</option>
            <option value="client_id">Client ID</option>
            <option value="created_at">Created At</option>
          </select>
          <button
            onClick={() => setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))}
            className="border border-gray-300 rounded-md px-2 py-2 text-black"
            title="Toggle sort order"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700"
          >
            Export CSV
          </button>
          <Link href="/dashboard/legal-customers/new">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Add Legal Customer
            </button>
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Legal Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCustomers.map(customer => (
              <tr key={customer.id}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(customer.id)}
                    onChange={() => handleSelect(customer.id)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-3 text-black font-medium">{customer.legal_name}</td>
                <td className="px-4 py-3 text-black">{customer.client_id}</td>
                <td className="px-4 py-3 text-black">{customer.address}</td>
                <td className="px-4 py-3 text-black">{customer.created_at ? new Date(customer.created_at).toLocaleDateString() : ''}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <Link href={`/dashboard/legal-customers/${customer.id}`}>
                    <button className="text-indigo-600 hover:text-indigo-900 font-semibold">View Details</button>
                  </Link>
                  <button onClick={() => handleDelete(customer.id)} disabled={deletingId === customer.id} className="ml-6 text-red-600 hover:text-red-800" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5h6v2m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <div className="mt-4">Loading...</div>}
      {error && <div className="mt-4 text-red-600">{error}</div>}
    </div>
  );
} 