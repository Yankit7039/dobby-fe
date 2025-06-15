'use client';

import { use, useState, useEffect } from 'react';
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

interface Client {
  id: number;
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

export default function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<Client | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/clients/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch client');
        }
        const data = await response.json();
        setClient(data);
        setEditedClient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch client');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedClient(client);
  };

  const handleSave = async () => {
    if (!editedClient) return;

    try {
      const response = await fetch(`${BASE_URL}/api/v1/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedClient),
      });

      if (!response.ok) {
        throw new Error('Failed to update client');
      }

      const updatedClient = await response.json();
      setClient(updatedClient);
      setEditedClient(updatedClient);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editedClient) return;

    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'settings') {
        setEditedClient(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            settings: {
              ...prev.settings,
              [child]: type === 'number' ? Number(value) : value
            }
          };
        });
      }
    } else {
      setEditedClient(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [name]: type === 'number' ? Number(value) : value
        };
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedClient) return;

    const { name, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'settings') {
        if (child === 'notification_settings') {
          const [setting, field] = name.split('.').slice(2);
          setEditedClient(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              settings: {
                ...prev.settings,
                notification_settings: {
                  ...prev.settings.notification_settings,
                  [field]: checked
                }
              }
            };
          });
        }
      }
    } else {
      setEditedClient(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [name]: checked
        };
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
      const response = await fetch(`${BASE_URL}/api/v1/clients/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete client');
      router.push('/dashboard/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
    }
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
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading client</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Client not found</h3>
              <div className="mt-2 text-sm text-yellow-700">
                The client you're looking for doesn't exist or has been deleted.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayClient = isEditing ? editedClient : client;

  return (
    <div className="p-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Client Details</h3>
          <p className="mt-1 text-sm text-gray-600">
            View and edit client information and settings.
          </p>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
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
                    disabled={!isEditing}
                    value={displayClient?.name || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 text-black"
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
                    disabled={!isEditing}
                    value={displayClient?.legal_name || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 text-black"
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
                    disabled={!isEditing}
                    value={displayClient?.office_address || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 text-black"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="default_currency" className="block text-sm font-medium text-gray-700">
                    Default Currency
                  </label>
                  <select
                    name="default_currency"
                    id="default_currency"
                    disabled={!isEditing}
                    value={displayClient?.default_currency || 'USD'}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 text-black"
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
                    disabled={!isEditing}
                    value={displayClient?.default_tax_rate || 0}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 text-black"
                  />
                </div>

                <div className="col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        name="active"
                        id="active"
                        disabled={!isEditing}
                        checked={displayClient?.active || false}
                        onChange={handleCheckboxChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded disabled:bg-gray-100 text-black"
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
                        disabled={!isEditing}
                        checked={displayClient?.settings.notification_settings.email_notifications || false}
                        onChange={handleCheckboxChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded disabled:bg-gray-100 text-black"
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
                        disabled={!isEditing}
                        checked={displayClient?.settings.notification_settings.sms_notifications || false}
                        onChange={handleCheckboxChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded disabled:bg-gray-100 text-black"
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
                Back
              </button>
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Client
                </button>
              )}
              {/* <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Delete
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 