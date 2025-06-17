
import React from 'react';
import { FaFileInvoiceDollar, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import { Invoice } from '@/types/dashboard';

interface InvoiceItemProps {
  invoice: Invoice;
}

export default function InvoiceItem({ invoice }: InvoiceItemProps) {
  return (
    <div className="group relative">
      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-md">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm">
            <FaFileInvoiceDollar className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <p className="font-bold text-gray-900 text-lg">#{invoice.id.slice(0, 8)}</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                <FaCheckCircle className="w-3 h-3 mr-1" />
                Completed
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FaCalendarAlt className="w-3 h-3" />
              <span>{new Date(invoice.date_generated).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right space-y-1">
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-gray-900 tabular-nums">${invoice.total}</p>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{invoice.currency}</span>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-full"></div>
          </div>
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-colors duration-300 pointer-events-none"></div>
    </div>
  );
}
