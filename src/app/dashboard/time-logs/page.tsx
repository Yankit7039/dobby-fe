
"use client";

import { useState, useEffect } from "react";
import { TimeLog, TimeLogsResponse } from '@/types/dashboard';
import Link from 'next/link';
import { FaPlus, FaDownload, FaEye, FaTrash, FaFilter, FaSort, FaSpinner, FaClock } from 'react-icons/fa';

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

export default function TimeLogsPage() {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortableTimeLogField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading time logs...</p>
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
              <h3 className="text-sm font-medium text-red-800">Error loading time logs</h3>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Time Logs</h1>
          <p className="text-gray-600">Track and manage your billable hours</p>
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
              <Link href="/dashboard/time-logs/new">
                <button className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 flex items-center gap-2 transition-colors">
                  <FaPlus className="text-sm" />
                  Add Time Log
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
                  placeholder="Search by client or task description..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 min-w-[280px]"
                />
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortableTimeLogField)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              >
                <option value="date">Sort by Date</option>
                <option value="client_id">Sort by Client</option>
                <option value="task_description">Sort by Task</option>
                <option value="amount">Sort by Amount</option>
              </select>
              <button
                onClick={() => setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 flex items-center gap-2"
                title="Toggle sort order"
              >
                <FaSort className="text-sm" />
                {sortOrder === 'asc' ? 'Oldest' : 'Newest'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {sortedLogs.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {sortedLogs.length} of {timeLogs.length} time logs
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Task Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Billable Hours</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(log.id)}
                        onChange={() => handleSelect(log.id)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{log.client_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 max-w-xs truncate">{log.task_description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">
                        {log.billable_hours ? `${log.billable_hours} hours` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">${log.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{new Date(log.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/dashboard/time-logs/${log.id}`}>
                          <button className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors">
                            {/* <FaEye className="text-sm" /> */}
                            View Details
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(log.id)} 
                          disabled={deletingId === log.id} 
                          className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          {deletingId === log.id ? (
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
        {sortedLogs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaClock className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No time logs found</h3>
            <p className="text-gray-500 mb-6">
              {filter ? 'Try adjusting your search criteria.' : 'Get started by logging your first time entry.'}
            </p>
            {!filter && (
              <Link href="/dashboard/time-logs/new">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto transition-colors">
                  <FaPlus className="text-sm" />
                  Add Time Log
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
