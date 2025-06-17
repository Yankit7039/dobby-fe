
'use client';

import { useState, useEffect } from 'react';
import { FaClock, FaFileInvoiceDollar, FaUsers, FaChartLine, FaArrowUp, FaDollarSign, FaPlus } from "react-icons/fa";
import Link from 'next/link';
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

const StatCard = ({ title, value, icon, trend, trendValue, color }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: string;
}) => (
  <div className="card animate-scale-in hover:scale-105 transition-transform duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        {trend && trendValue && (
          <div className={`flex items-center mt-2 text-sm ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <FaArrowUp className={`w-3 h-3 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {trendValue}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color || 'bg-blue-100'}`}>
        <div className={`w-8 h-8 ${color ? 'text-white' : 'text-blue-600'} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  </div>
);

const ActivityCard = ({ title, children, action }: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="card animate-slide-in">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {action}
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const TimeLogItem = ({ timeLog }: { timeLog: TimeLog }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <FaClock className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <p className="font-medium text-gray-900">{timeLog.task_description}</p>
        <p className="text-sm text-gray-500">{new Date(timeLog.date).toLocaleDateString()}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-semibold text-gray-900">${timeLog.amount}</p>
      <p className="text-sm text-gray-500">{timeLog.billable_hours}h</p>
    </div>
  </div>
);

const InvoiceItem = ({ invoice }: { invoice: Invoice }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
        <FaFileInvoiceDollar className="w-5 h-5 text-green-600" />
      </div>
      <div>
        <p className="font-medium text-gray-900">Invoice #{invoice.id.slice(0, 8)}</p>
        <p className="text-sm text-gray-500">{new Date(invoice.date_generated).toLocaleDateString()}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-semibold text-gray-900">${invoice.total} {invoice.currency}</p>
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Completed
      </span>
    </div>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalInvoices: 0,
    totalTimeLogs: 0,
    totalLegalCustomers: 0,
    recentTimeLogs: [],
    recentInvoices: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, invoicesRes, timeLogsRes, legalCustomersRes] = await Promise.all([
          fetch(`${BASE_URL}/api/v1/clients`),
          fetch(`${BASE_URL}/api/v1/invoices`),
          fetch(`${BASE_URL}/api/v1/work-logs`),
          fetch(`${BASE_URL}/api/v1/legal-customers`),
        ]);

        const [clients, invoices, timeLogs, legalCustomers] = await Promise.all([
          clientsRes.json() as Promise<ClientsResponse>,
          invoicesRes.json() as Promise<InvoicesResponse>,
          timeLogsRes.json() as Promise<TimeLogsResponse>,
          legalCustomersRes.json() as Promise<LegalCustomersResponse>,
        ]);

        setStats({
          totalClients: clients.clients?.length || 0,
          totalInvoices: invoices.invoices?.length || 0,
          totalTimeLogs: timeLogs.work_logs?.length || 0,
          totalLegalCustomers: legalCustomers.legal_customers?.length || 0,
          recentTimeLogs: timeLogs.work_logs?.slice(0, 5) || [],
          recentInvoices: invoices.invoices?.slice(0, 5) || [],
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-12 w-12 bg-gray-200 rounded-xl ml-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
            <p className="text-blue-100">Here's what's happening with your business today.</p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FaChartLine className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={<FaUsers className="w-6 h-6" />}
          trend="up"
          trendValue="+12% from last month"
          color="bg-blue-500"
        />
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={<FaFileInvoiceDollar className="w-6 h-6" />}
          trend="up"
          trendValue="+8% from last month"
          color="bg-green-500"
        />
        <StatCard
          title="Total Time Logs"
          value={stats.totalTimeLogs}
          icon={<FaClock className="w-6 h-6" />}
          trend="up"
          trendValue="+23% from last month"
          color="bg-orange-500"
        />
        <StatCard
          title="Legal Customers"
          value={stats.totalLegalCustomers}
          icon={<FaChartLine className="w-6 h-6" />}
          trend="up"
          trendValue="+5% from last month"
          color="bg-purple-500"
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActivityCard 
          title="Recent Time Logs"
          action={
            <Link 
              href="/dashboard/time-logs/new"
              className="btn btn-primary btn-sm"
            >
              <FaPlus className="w-4 h-4" />
              Add Time Log
            </Link>
          }
        >
          {stats.recentTimeLogs.length > 0 ? (
            stats.recentTimeLogs.map((log) => (
              <TimeLogItem key={log.id} timeLog={log} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaClock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No time logs yet. Create your first one!</p>
            </div>
          )}
          {stats.recentTimeLogs.length > 0 && (
            <Link 
              href="/dashboard/time-logs" 
              className="block text-center text-blue-600 hover:text-blue-700 font-medium mt-4"
            >
              View all time logs →
            </Link>
          )}
        </ActivityCard>

        <ActivityCard 
          title="Recent Invoices"
          action={
            <Link 
              href="/dashboard/invoices/new"
              className="btn btn-primary btn-sm"
            >
              <FaPlus className="w-4 h-4" />
              Create Invoice
            </Link>
          }
        >
          {stats.recentInvoices.length > 0 ? (
            stats.recentInvoices.map((invoice) => (
              <InvoiceItem key={invoice.id} invoice={invoice} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaFileInvoiceDollar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No invoices yet. Create your first one!</p>
            </div>
          )}
          {stats.recentInvoices.length > 0 && (
            <Link 
              href="/dashboard/invoices" 
              className="block text-center text-blue-600 hover:text-blue-700 font-medium mt-4"
            >
              View all invoices →
            </Link>
          )}
        </ActivityCard>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/time-logs/new" className="card hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <FaClock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Log Time</h3>
              <p className="text-sm text-gray-500">Track your billable hours</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/invoices/new" className="card hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <FaFileInvoiceDollar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Create Invoice</h3>
              <p className="text-sm text-gray-500">Generate new invoice</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/clients/new" className="card hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <FaUsers className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Client</h3>
              <p className="text-sm text-gray-500">Register new client</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
