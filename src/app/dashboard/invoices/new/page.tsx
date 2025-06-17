'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BASE_URL = "http://localhost:8000";

interface Client {
  id: number;
  name: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

interface NewInvoice {
  client_id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  notes: string;
  terms: string;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);

  const [invoice, setInvoice] = useState<NewInvoice>({
    client_id: 0,
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        tax_rate: 0
      }
    ],
    notes: '',
    terms: ''
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/clients`);
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        const data = await response.json();
        setClients(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      }
    };

    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/api/v1/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      router.push('/dashboard/invoices');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('items.')) {
      const [index, field] = name.split('.');
      const itemIndex = parseInt(index);
      setInvoice(prev => ({
        ...prev,
        items: prev.items.map((item, i) => 
          i === itemIndex 
            ? { ...item, [field]: type === 'number' ? Number(value) : value }
            : item
        )
      }));
    } else {
      setInvoice(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  const addItem = () => {
    setInvoice(prev => ({
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
    }));
  };

  const removeItem = (index: number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    return invoice.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      return sum + (itemTotal * (item.tax_rate / 100));
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <div className="p-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">New Invoice</h3>
          <p className="mt-1 text-sm text-gray-600">
            Create a new invoice for a client.
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
                        <h3 className="text-sm font-medium text-red-800">Error creating invoice</h3>
                        <div className="mt-2 text-sm text-red-700">{error}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">
                      Client
                    </label>
                    <select
                      name="client_id"
                      id="client_id"
                      required
                      value={invoice.client_id}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                    >
                      <option value="">Select a client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
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
                      value={invoice.invoice_number}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
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
                      value={invoice.issue_date}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
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
                      value={invoice.due_date}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900">Items</h4>
                  <div className="mt-4 space-y-4">
                    {invoice.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-6 gap-4 items-end">
                        <div className="col-span-2">
                          <label htmlFor={`items.${index}.description`} className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <input
                            type="text"
                            name={`items.${index}.description`}
                            required
                            value={item.description}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
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
                            value={item.quantity}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
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
                            value={item.unit_price}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
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
                            value={item.tax_rate}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-black"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addItem}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-black"
                    >
                      Add Item
                    </button>
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
                        value={invoice.notes}
                        onChange={handleChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
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
                        value={invoice.terms}
                        onChange={handleChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
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
                      <dd className="text-base font-medium text-gray-900">${calculateTotal().toFixed(2)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-black"
                >
                  {loading ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 