'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BASE_URL = "http://localhost:8000";

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

interface Invoice {
  id: number;
  client_id: number;
  client_name: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  notes: string;
  terms: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
}

export default function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/invoices/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch invoice');
        }
        const data = await response.json();
        setInvoice(data);
        setEditedInvoice(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch invoice');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInvoice(invoice);
  };

  const handleSave = async () => {
    if (!editedInvoice) return;

    try {
      const response = await fetch(`${BASE_URL}/api/v1/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedInvoice),
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice');
      }

      const updatedInvoice = await response.json();
      setInvoice(updatedInvoice);
      setEditedInvoice(updatedInvoice);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editedInvoice) return;

    const { name, value, type } = e.target;
    
    if (name.startsWith('items.')) {
      const [_, index, field] = name.split('.');
      const itemIndex = parseInt(index);
      setEditedInvoice(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item, i) => 
            i === itemIndex 
              ? { ...item, [field]: type === 'number' ? Number(value) : value }
              : item
          )
        };
      });
    } else {
      setEditedInvoice(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [name]: type === 'number' ? Number(value) : value
        };
      });
    }
  };

  const addItem = () => {
    if (!editedInvoice) return;

    setEditedInvoice(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            description: '',
            quantity: 1,
            unit_price: 0,
            tax_rate: 0
          }
        ]
      };
    });
  };

  const removeItem = (index: number) => {
    if (!editedInvoice) return;

    setEditedInvoice(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      };
    });
  };

  const calculateSubtotal = () => {
    if (!invoice) return 0;
    return (invoice.items || []).reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    if (!invoice) return 0;
    return (invoice.items || []).reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      return sum + (itemTotal * (item.tax_rate / 100));
    }, 0);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      const response = await fetch(`${BASE_URL}/api/v1/invoices/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete invoice');
      router.push('/dashboard/invoices');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
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
              <h3 className="text-sm font-medium text-red-800">Error loading invoice</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
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
              <h3 className="text-sm font-medium text-yellow-800">Invoice not found</h3>
              <div className="mt-2 text-sm text-yellow-700">
                The invoice you're looking for doesn't exist or has been deleted.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayInvoice = isEditing ? editedInvoice : invoice;

  return (
    <div className="p-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Invoice Details</h3>
          <p className="mt-1 text-sm text-gray-600">
            View and edit invoice information.
          </p>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Client
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {displayInvoice?.client_name}
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    name="invoice_number"
                    id="invoice_number"
                    required
                    disabled={!isEditing}
                    value={displayInvoice?.invoice_number || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 text-black"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    name="issue_date"
                    id="issue_date"
                    required
                    disabled={!isEditing}
                    value={displayInvoice?.issue_date || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 text-black"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    id="due_date"
                    required
                    disabled={!isEditing}
                    value={displayInvoice?.due_date || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 text-black"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900">Items</h4>
                <div className="mt-4 space-y-4">
                  {(displayInvoice?.items || []).map((item, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4 items-end">
                      <div className="col-span-2">
                        <label htmlFor={`items.${index}.description`} className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <input
                          type="text"
                          name={`items.${index}.description`}
                          required
                          disabled={!isEditing}
                          value={item.description}
                          onChange={handleChange}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 text-black"
                        />
                      </div>
                      <div>
                        <label htmlFor={`items.${index}.quantity`} className="block text-sm font-medium text-gray-700">
                          Quantity
                        </label>
                        <input
                          type="number"
                          name={`items.${index}.quantity`}
                          min="1"
                          required
                          disabled={!isEditing}
                          value={item.quantity}
                          onChange={handleChange}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 text-black"
                        />
                      </div>
                      <div>
                        <label htmlFor={`items.${index}.unit_price`} className="block text-sm font-medium text-gray-700">
                          Unit Price
                        </label>
                        <input
                          type="number"
                          name={`items.${index}.unit_price`}
                          min="0"
                          step="0.01"
                          required
                          disabled={!isEditing}
                          value={item.unit_price}
                          onChange={handleChange}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 text-black"
                        />
                      </div>
                      <div>
                        <label htmlFor={`items.${index}.tax_rate`} className="block text-sm font-medium text-gray-700">
                          Tax Rate (%)
                        </label>
                        <input
                          type="number"
                          name={`items.${index}.tax_rate`}
                          min="0"
                          max="100"
                          step="0.01"
                          required
                          disabled={!isEditing}
                          value={item.tax_rate}
                          onChange={handleChange}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 text-black"
                        />
                      </div>
                      {isEditing && (
                        <div>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={addItem}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Item
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows={3}
                      disabled={!isEditing}
                      value={displayInvoice?.notes || ''}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 text-black"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
                      Terms
                    </label>
                    <textarea
                      name="terms"
                      id="terms"
                      rows={3}
                      disabled={!isEditing}
                      value={displayInvoice?.terms || ''}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 text-black"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <dl className="grid grid-cols-6 gap-4">
                  <div className="col-span-4 text-right">
                    <dt className="text-sm font-medium text-gray-500">Subtotal:</dt>
                  </div>
                  <div className="col-span-2">
                    <dd className="text-sm text-gray-900">${calculateSubtotal().toFixed(2)}</dd>
                  </div>
                  <div className="col-span-4 text-right">
                    <dt className="text-sm font-medium text-gray-500">Tax:</dt>
                  </div>
                  <div className="col-span-2">
                    <dd className="text-sm text-gray-900">${calculateTax().toFixed(2)}</dd>
                  </div>
                  <div className="col-span-4 text-right">
                    <dt className="text-base font-medium text-gray-900">Total:</dt>
                  </div>
                  <div className="col-span-2">
                    <dd className="text-base font-medium text-gray-900">${displayInvoice?.total.toFixed(2)}</dd>
                  </div>
                </dl>
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
                  Edit Invoice
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