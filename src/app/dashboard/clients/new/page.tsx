'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

interface NewClient {
  name: string;
  legal_name: string;
  office_address: string;
  active: boolean;
  default_currency: string;
  default_tax_rate: number;
  settings: ClientSettings;
}

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [client, setClient] = useState<NewClient>({
    name: '',
    legal_name: '',
    office_address: '',
    active: true,
    default_currency: 'USD',
    default_tax_rate: 0,
    settings: {
      business_hours: {
        days: ['mon', 'tue', 'wed', 'thu', 'fri'],
        start: '09:00',
        end: '18:00'
      },
      language: 'en',
      logo_url: 'https://example.com/logo.png',
      notification_settings: {
        email_notifications: true,
        sms_notifications: false
      },
      theme_color: '#1E40AF',
      timezone: 'Asia/Kolkata'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/api/v1/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      });

      if (!response.ok) {
        throw new Error('Failed to create client');
      }

      router.push('/dashboard/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'settings') {
        setClient(prev => ({
          ...prev,
          settings: {
            ...prev.settings,
            [child]: type === 'number' ? Number(value) : value
          }
        }));
      }
    } else {
      setClient(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'settings') {
        if (child === 'notification_settings') {
          const [setting, field] = name.split('.').slice(2);
          setClient(prev => ({
            ...prev,
            settings: {
              ...prev.settings,
              notification_settings: {
                ...prev.settings.notification_settings,
                [field]: checked
              }
            }
          }));
        }
      }
    } else {
      setClient(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };

  return (
    <div className="p-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">New Client</h3>
          <p className="mt-1 text-sm text-gray-600">
            Create a new client with their basic information and settings.
          </p>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                {error && (
                  <div className="bg-red-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error creating client</h3>
                        <div className="mt-2 text-sm text-red-700">{error}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={client.name}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="legal_name" className="block text-sm font-medium text-gray-700">
                      Legal Name
                    </label>
                    <input
                      type="text"
                      name="legal_name"
                      id="legal_name"
                      required
                      value={client.legal_name}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                    />
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="office_address" className="block text-sm font-medium text-gray-700">
                      Office Address
                    </label>
                    <textarea
                      name="office_address"
                      id="office_address"
                      rows={3}
                      value={client.office_address}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="default_currency" className="block text-sm font-medium text-gray-700">
                      Default Currency
                    </label>
                    <select
                      name="default_currency"
                      id="default_currency"
                      value={client.default_currency}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="default_tax_rate" className="block text-sm font-medium text-gray-700">
                      Default Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      name="default_tax_rate"
                      id="default_tax_rate"
                      min="0"
                      max="100"
                      step="0.01"
                      value={client.default_tax_rate}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                    />
                  </div>

                  <div className="col-span-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          name="active"
                          id="active"
                          checked={client.active}
                          onChange={handleCheckboxChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded text-black"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="active" className="font-medium text-gray-700">
                          Active
                        </label>
                        <p className="text-gray-500">Is this client currently active?</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          name="settings.notification_settings.email_notifications"
                          id="email_notifications"
                          checked={client.settings.notification_settings.email_notifications}
                          onChange={handleCheckboxChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded text-black"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="email_notifications" className="font-medium text-gray-700">
                          Email Notifications
                        </label>
                        <p className="text-gray-500">Enable email notifications for this client</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          name="settings.notification_settings.sms_notifications"
                          id="sms_notifications"
                          checked={client.settings.notification_settings.sms_notifications}
                          onChange={handleCheckboxChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded text-black"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="sms_notifications" className="font-medium text-gray-700">
                          SMS Notifications
                        </label>
                        <p className="text-gray-500">Enable SMS notifications for this client</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Creating...' : 'Create Client'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 