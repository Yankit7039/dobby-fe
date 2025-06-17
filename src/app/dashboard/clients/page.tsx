'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const BASE_URL = "http://localhost:8000";

interface BusinessHours {
  days: string[];
  start: string;
  end: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
}

interface ClientSettings {
  business_hours: BusinessHours;
  language: string;
  logo_url: string;
  notification_settings: NotificationSettings;
  theme_color: string;
  timezone: string;
}

interface Client {
  id: string;
  name: string;
  legal_name: string;
  office_address: string;
  active: boolean;
  default_currency: string;
  default_tax_rate: number;
  settings: ClientSettings;
  created_at: string;
  updated_at: string;
}

function exportToCSV(data: Client[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csvRows = [
    keys.join(','),
    ...data.map(row => keys.map(k => JSON.stringify(row[k as keyof Client] ?? '')).join(','))
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

type SortableClientField = 'name' | 'legal_name' | 'created_at';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortableClientField>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/clients`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setClients(data.clients);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    setDeletingId(id);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/clients/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete client');
      setClients(prev => prev.filter((c: Client) => c.id !== id));
      setSelected(prev => prev.filter(cid => cid !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete client');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter and sort logic
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(filter.toLowerCase()) ||
    client.legal_name.toLowerCase().includes(filter.toLowerCase())
  );
  const sortedClients = [...filteredClients].sort((a, b) => {
    let aVal = '', bVal = '';
    if (sortBy === 'name') {
      aVal = a.name?.toLowerCase() ?? '';
      bVal = b.name?.toLowerCase() ?? '';
    } else if (sortBy === 'legal_name') {
      aVal = a.legal_name?.toLowerCase() ?? '';
      bVal = b.legal_name?.toLowerCase() ?? '';
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
      setSelected(sortedClients.map(c => c.id));
      setSelectAll(true);
    }
  };

  const handleExport = () => {
    const exportData = sortedClients.filter(c => selected.includes(c.id));
    exportToCSV(exportData.length ? exportData : sortedClients, 'clients.csv');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading clients</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Filter by name or email"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-black"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortableClientField)}
            className="border border-gray-300 rounded-md px-2 py-2 text-black"
          >
            <option value="name">Name</option>
            <option value="legal_name">Legal Name</option>
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
          <Link href="/dashboard/clients/new">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Add Client
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Legal Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedClients.map(client => (
              <tr key={client.id}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(client.id)}
                    onChange={() => handleSelect(client.id)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-3 text-black font-medium">{client.name}</td>
                <td className="px-4 py-3 text-black">{client.legal_name}</td>
                <td className="px-4 py-3 text-black">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    client.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {client.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-black">{client.default_currency}</td>
                <td className="px-4 py-3 text-black">{new Date(client.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <Link href={`/dashboard/clients/${client.id}`}>
                    <button className="text-indigo-600 hover:text-indigo-900 font-semibold">View Details</button>
                  </Link>
                  <button onClick={() => handleDelete(client.id)} disabled={deletingId === client.id} className="ml-6 text-red-600 hover:text-red-800" title="Delete">
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