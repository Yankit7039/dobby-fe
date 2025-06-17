"use client";

import { useState, useEffect } from "react";
import { TimeLog, TimeLogsResponse } from '@/types/dashboard';
import Link from 'next/link';

const BASE_URL = "http://localhost:8000";

function exportToCSV(data: TimeLog[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csvRows = [
    keys.join(','),
    ...data.map(row => keys.map(k => JSON.stringify(row[k as keyof TimeLog] ?? '')).join(','))
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

type SortableTimeLogField = 'client_id' | 'task_description' | 'date' | 'amount';

// interface TimeLog {
//   id: string;
//   user_id: string;
//   client_id: string;
//   legal_customers_id: string;
//   billable_hours: number | null;
//   task_description: string;
//   status: string;
//   amount: number;
//   date: string;
//   created_at: string;
//   updated_at: string;
// }

export default function TimeLogsPage() {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortableTimeLogField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchTimeLogs = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/work-logs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data: TimeLogsResponse = await response.json();
        setTimeLogs(data.work_logs);
      } catch (err) {
        setError('Failed to fetch time logs');
        console.error('Error fetching time logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeLogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time log?')) return;
    setDeletingId(id);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/work-logs/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete time log');
      setTimeLogs(prev => prev.filter((log: TimeLog) => log.id !== id));
      setSelected(prev => prev.filter(cid => cid !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete time log');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter and sort logic
  const filteredLogs = timeLogs.filter(log =>
    log.client_id?.toLowerCase().includes(filter.toLowerCase()) ||
    log.task_description?.toLowerCase().includes(filter.toLowerCase())
  );
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    let aVal = '', bVal = '';
    if (sortBy === 'client_id') {
      aVal = a.client_id?.toLowerCase() ?? '';
      bVal = b.client_id?.toLowerCase() ?? '';
    } else if (sortBy === 'task_description') {
      aVal = a.task_description?.toLowerCase() ?? '';
      bVal = b.task_description?.toLowerCase() ?? '';
    } else if (sortBy === 'date') {
      aVal = a.date ?? '';
      bVal = b.date ?? '';
    } else if (sortBy === 'amount') {
      aVal = a.amount?.toString() ?? '';
      bVal = b.amount?.toString() ?? '';
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
      setSelected(sortedLogs.map(log => log.id));
      setSelectAll(true);
    }
  };

  const handleExport = () => {
    const exportData = sortedLogs.filter(log => selected.includes(log.id));
    exportToCSV(exportData.length ? exportData : sortedLogs, 'time_logs.csv');
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
            <h3 className="text-sm font-medium text-red-800">Error loading time logs</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Time Logs</h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Filter by client or task description"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-black"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortableTimeLogField)}
            className="border border-gray-300 rounded-md px-2 py-2 text-black"
          >
            <option value="client_id">Client</option>
            <option value="task_description">Task Description</option>
            <option value="date">Date</option>
            <option value="amount">Amount</option>
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
          <Link href="/dashboard/time-logs/new">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Add Time Log
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billable Hours</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLogs.map(log => (
              <tr key={log.id}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(log.id)}
                    onChange={() => handleSelect(log.id)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-3 text-black font-medium">{log.client_id}</td>
                <td className="px-4 py-3 text-black">{log.task_description}</td>
                <td className="px-4 py-3 text-black">{log.billable_hours ? `${log.billable_hours} hours` : 'N/A'}</td>
                <td className="px-4 py-3 text-black">${log.amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-black">{new Date(log.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <Link href={`/dashboard/time-logs/${log.id}`}>
                    <button className="text-indigo-600 hover:text-indigo-900 font-semibold">View Details</button>
                  </Link>
                  <button onClick={() => handleDelete(log.id)} disabled={deletingId === log.id} className="ml-6 text-red-600 hover:text-red-800" title="Delete">
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
    </div>
  );
} 