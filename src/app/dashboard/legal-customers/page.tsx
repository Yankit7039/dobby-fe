"use client";

import { useState, useEffect } from "react";
import { LegalCustomer, LegalCustomersResponse } from '@/types/dashboard';

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Legal Customers</h1>
      <div className="mb-4 flex gap-4 items-center">
        <input
          type="text"
          placeholder="Filter..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="border p-2 rounded"
        >
          <option value="legal_name">Legal Name</option>
          <option value="client_id">Client ID</option>
          <option value="created_at">Created At</option>
        </select>
        <button
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="border p-2 rounded"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
        <button
          onClick={handleExport}
          disabled={selected.length === 0}
          className="border p-2 rounded bg-blue-500 text-white disabled:bg-gray-300"
        >
          Export Selected
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border p-2">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="border p-2">Legal Name</th>
              <th className="border p-2">Client ID</th>
              <th className="border p-2">Address</th>
              <th className="border p-2">Created At</th>
              <th className="border p-2">Updated At</th>
            </tr>
          </thead>
          <tbody>
            {sortedCustomers.map((customer) => (
              <tr key={customer.id}>
                <td className="border p-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(customer.id)}
                    onChange={() => handleSelect(customer.id)}
                  />
                </td>
                <td className="border p-2">{customer.legal_name}</td>
                <td className="border p-2">{customer.client_id}</td>
                <td className="border p-2">{customer.address}</td>
                <td className="border p-2">{new Date(customer.created_at).toLocaleDateString()}</td>
                <td className="border p-2">{new Date(customer.updated_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 