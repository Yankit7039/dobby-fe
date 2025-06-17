import { Invoice } from '@/types/dashboard';

interface InvoiceItemProps {
  invoice: Invoice;
}

export default function InvoiceItem({ invoice }: InvoiceItemProps) {
  return (
    <div className="border p-4 rounded-lg">
      <p className="font-semibold">Invoice #{invoice.id}</p>
      <p className="text-gray-600">Client ID: {invoice.client_id}</p>
      <p className="text-gray-600">Customer ID: {invoice.customer_id}</p>
      <p className="text-gray-600">Amount: {invoice.currency} {invoice.total}</p>
      <p className="text-gray-600">Date Generated: {new Date(invoice.date_generated).toLocaleDateString()}</p>
      {invoice.pdf_url && (
        <a
          href={invoice.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          View PDF
        </a>
      )}
    </div>
  );
} 