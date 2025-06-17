
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaUser, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaPercent, FaCreditCard, FaSave, FaTimes, FaBell } from "react-icons/fa";

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
  name: string;
  email: string;
  legal_name: string;
  office_address: string;
  website: string;
  default_currency: string;
  default_tax_rate: number;
  default_hourly_rate: number;
  //  payment_terms: string;
  settings: ClientSettings;
}

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [client, setClient] = useState<Client>({
    name: "",
    email: "",
    legal_name: "",
    office_address: "",
    website: "",
    default_currency: "USD",
    default_tax_rate: 0.1,
    default_hourly_rate: 100,
    // payment_terms: "Net 30",
    settings: {
      business_hours: {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        start: "09:00",
        end: "17:00",
      },
      language: "en",
      logo_url: "",
      notification_settings: {
        email_notifications: false,
        sms_notifications: false,
      },
      theme_color: "#3B82F6",
      timezone: "UTC",
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClient(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/v1/clients/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(client),
      });

      if (!response.ok) {
        throw new Error("Failed to create client");
      }

      router.push("/dashboard/clients");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/clients" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4 transition-colors">
            <FaArrowLeft className="mr-4" />
            Back to Clients
          </Link>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Client</h1>
            <p className="text-gray-600">Create a new client profile to start tracking time and generating invoices.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center mb-6">
              <FaUser className="text-indigo-600 mr-3 text-xl" />
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={client.name}
                  onChange={handleChange}
                  className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={client.email}
                    onChange={handleChange}
                    className="text-gray-900 w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                    placeholder="client@example.com"
                  />
                </div>
              </div>

              {/* <div> */}
                {/* <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="email"
                    id="email"
                    value={client.email}
                    onChange={handleChange}
                    className="text-gray-900 w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                    placeholder="+1 (555) 123-4567"
                  />
                </div> */}
              {/* </div> */}

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Name
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="legal_name"
                    id="legal_name"
                    value={client.legal_name}
                    onChange={handleChange}
                    className="text-gray-900 w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                    placeholder="Legal name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center mb-6">
              <FaMapMarkerAlt className="text-indigo-600 mr-3 text-xl" />
              <h2 className="text-xl font-semibold text-gray-900">Contact Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Office Address
                </label>
                <textarea
                  name="office_address"
                  id="office_address"
                  rows={3}
                  value={client.office_address}
                  onChange={handleChange}
                  className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                  placeholder="Enter full address"
                />
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center mb-6">
              <FaCreditCard className="text-indigo-600 mr-3 text-xl" />
              <h2 className="text-xl font-semibold text-gray-900">Billing Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* <div>
                <label htmlFor="default_hourly_rate" className="block text-sm font-medium text-gray-700 mb-2">
                  Default Hourly Rate ($)
                </label>
                <input
                  type="number"
                  name="default_hourly_rate"
                  id="default_hourly_rate"
                  min="0"
                  step="0.01"
                  value={client.default_hourly_rate}
                  onChange={handleChange}
                  className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                  placeholder="0.00"
                />
              </div> */}

              <div>
                <label htmlFor="default_tax_rate" className="block text-sm font-medium text-gray-700 mb-2">
                  Default Tax Rate (%)
                </label>
                <div className="relative">
                  <FaPercent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="default_tax_rate"
                    id="default_tax_rate"
                    min="0"
                    max="100"
                    step="0.01"
                    value={client.default_tax_rate}
                    onChange={handleChange}
                    className="text-gray-900 w-full px-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="default_currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Default Currency
                </label>
                <select
                  name="default_currency"
                  id="default_currency"
                  value={client.default_currency}
                  onChange={handleChange}
                  className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/70"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="INR">INR</option>
                  {/* <option value="Due on Receipt">Due on Receipt</option> */}
                </select>
              </div>

            </div>

          </div>

          {/* Notification Settings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center mb-6">
              <FaBell className="text-indigo-600 mr-3 text-xl" />
              <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="email_notifications"
                    name="email_notifications"
                    checked={client.settings.notification_settings.email_notifications}
                    onChange={() => {
                      setClient(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          notification_settings: {
                            ...prev.settings.notification_settings,
                            email_notifications: !prev.settings.notification_settings.email_notifications,
                          },
                        },
                      }));
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="email_notifications" className="text-sm font-medium text-gray-700">
                    Email Notifications
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="sms_notifications"
                    name="sms_notifications"
                    checked={client.settings.notification_settings.sms_notifications}
                    onChange={() => {
                      setClient(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          notification_settings: {
                            ...prev.settings.notification_settings,
                            sms_notifications: !prev.settings.notification_settings.sms_notifications,
                          },
                        },
                      }));
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="sms_notifications" className="text-sm font-medium text-gray-700">
                    SMS Notifications
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard/clients"
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center"
            >
              <FaTimes className="mr-2" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg"
            >
              <FaSave className="mr-2" />
              {loading ? "Creating..." : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
