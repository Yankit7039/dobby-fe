'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaClock, FaFileInvoiceDollar, FaUsers, FaChartLine } from "react-icons/fa";
import StatCard from '@/components/dashboard/StatCard';
import ActivityCard from '@/components/dashboard/ActivityCard';
import TimeLogItem from '@/components/dashboard/TimeLogItem';
import InvoiceItem from '@/components/dashboard/InvoiceItem';

const BASE_URL = "http://localhost:8000";

interface DashboardStats {
  totalClients: number;
  totalInvoices: number;
  totalTimeLogs: number;
  totalLegalCustomers: number;
  recentTimeLogs: any[];
  recentInvoices: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalInvoices: 0,
    totalTimeLogs: 0,
    totalLegalCustomers: 0,
    recentTimeLogs: [],
    recentInvoices: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch clients
        const clientsResponse = await fetch(`${BASE_URL}/api/v1/clients`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const clientsData = await clientsResponse.json();

        // Fetch invoices
        const invoicesResponse = await fetch(`${BASE_URL}/api/v1/invoices`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const invoicesData = await invoicesResponse.json();

        // Fetch time logs
        const timeLogsResponse = await fetch(`${BASE_URL}/api/v1/work-logs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const timeLogsData = await timeLogsResponse.json();

        // Fetch legal customers
        const legalCustomersResponse = await fetch(`${BASE_URL}/api/v1/legal-customers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const legalCustomersData = await legalCustomersResponse.json();

        setStats({
          totalClients: clientsData.clients.length,
          totalInvoices: invoicesData.invoices.length,
          totalTimeLogs: timeLogsData.work_logs.length,
          totalLegalCustomers: legalCustomersData.legal_customers.length,
          recentTimeLogs: timeLogsData.work_logs.slice(0, 5),
          recentInvoices: invoicesData.invoices.slice(0, 5)
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        <StatCard
          icon={<FaClock className="text-indigo-600" />}
          value={stats?.totalTimeLogs ?? "127.5 hrs"}
          label="Total Time Logs"
          change="+12.3%"
          changeColor="bg-green-100 text-green-700"
        />
        <StatCard
          icon={<FaFileInvoiceDollar className="text-green-600" />}
          value={stats?.totalInvoices ?? "$24,750"}
          label="Total Invoices"
          change="+8.1%"
          changeColor="bg-green-100 text-green-700"
        />
        <StatCard
          icon={<FaUsers className="text-blue-700" />}
          value={stats?.totalClients ?? "18 clients"}
          label="Total Clients"
          change="+2"
          changeColor="bg-green-100 text-green-700"
        />
        <StatCard
          icon={<FaChartLine className="text-green-600" />}
          value={stats?.totalLegalCustomers ?? "$89,250"}
          label="Total Legal Customers"
          change="+15.7%"
          changeColor="bg-green-100 text-green-700"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ActivityCard
          title="Recent Time Logs"
          items={stats.recentTimeLogs}
          renderItem={(log) => <TimeLogItem log={log} />}
          viewAllLink="/dashboard/time-logs"
        />
        <ActivityCard
          title="Recent Invoices"
          items={stats.recentInvoices}
          renderItem={(invoice) => <InvoiceItem invoice={invoice} />}
          viewAllLink="/dashboard/invoices"
        />
      </div>
    </div>
  );
} 