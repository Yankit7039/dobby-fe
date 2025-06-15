interface Invoice {
  id: string;
  total: number;
  currency: string;
  date_generated: string;
  pdf_url: string;
}

export default function InvoiceItem({ invoice }: { invoice: Invoice }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          Invoice #{invoice.id.slice(-6)}
        </p>
        <div className="mt-1 flex items-center text-sm text-gray-500">
          <span className="truncate">
            {invoice.total.toFixed(2)} {invoice.currency}
          </span>
        </div>
      </div>
      <div className="ml-4 flex-shrink-0 flex space-x-2">
        <a
          href={invoice.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-900 text-sm"
        >
          PDF
        </a>
        <span className="text-gray-500">•</span>
        <span className="text-sm text-gray-500">
          {new Date(invoice.date_generated).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
} 