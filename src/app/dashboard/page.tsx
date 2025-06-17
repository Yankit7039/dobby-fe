'use client';

import { useState, useEffect } from 'react';
// import Link from 'next/link';
import { FaClock, FaFileInvoiceDollar, FaUsers, FaChartLine } from "react-icons/fa";
import StatCard from '@/components/dashboard/StatCard';
import ActivityCard from '@/components/dashboard/ActivityCard';
import TimeLogItem from '@/components/dashboard/TimeLogItem';
import InvoiceItem from '@/components/dashboard/InvoiceItem';
import { TimeLog, Invoice, ClientsResponse, InvoicesResponse, TimeLogsResponse, LegalCustomersResponse } from '@/types/dashboard';

const BASE_URL = "http://localhost:8000";

interface DashboardStats {
  totalClients: number;
  totalInvoices: number;
  totalTimeLogs: number;
  totalLegalCustomers: number;
  recentTimeLogs: TimeLog[];
  recentInvoices: Invoice[];
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
        const clientsData: ClientsResponse = await clientsResponse.json();

        // Fetch invoices
        const invoicesResponse = await fetch(`${BASE_URL}/api/v1/invoices`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const invoicesData: InvoicesResponse = await invoicesResponse.json();

        // Fetch time logs
        const timeLogsResponse = await fetch(`${BASE_URL}/api/v1/work-logs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const timeLogsData: TimeLogsResponse = await timeLogsResponse.json();

        // Fetch legal customers
        const legalCustomersResponse = await fetch(`${BASE_URL}/api/v1/legal-customers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const legalCustomersData: LegalCustomersResponse = await legalCustomersResponse.json();

        setStats({
          totalClients: clientsData.clients.length,
          totalInvoices: invoicesData.invoices.length,
          totalTimeLogs: timeLogsData.work_logs.length,
          totalLegalCustomers: legalCustomersData.legal_customers.length,
          recentTimeLogs: timeLogsData.work_logs.slice(0, 5),
          recentInvoices: invoicesData.invoices.slice(0, 5)
        });
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={<FaUsers className="w-6 h-6" />}
        />
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={<FaFileInvoiceDollar className="w-6 h-6" />}
        />
        <StatCard
          title="Total Time Logs"
          value={stats.totalTimeLogs}
          icon={<FaClock className="w-6 h-6" />}
        />
        <StatCard
          title="Total Legal Customers"
          value={stats.totalLegalCustomers}
          icon={<FaChartLine className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActivityCard title="Recent Time Logs">
          {stats.recentTimeLogs.map((log) => (
            <TimeLogItem key={log.id} timeLog={log} />
          ))}
        </ActivityCard>
        <ActivityCard title="Recent Invoices">
          {stats.recentInvoices.map((invoice) => (
            <InvoiceItem key={invoice.id} invoice={invoice} />
          ))}
        </ActivityCard>
      </div>
    </div>
  );
} 