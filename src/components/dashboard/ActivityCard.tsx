'use client';

import Link from 'next/link';

interface ActivityCardProps {
  title: string;
  items: any[];
  renderItem: (item: any) => React.ReactNode;
  viewAllLink: string;
}

export default function ActivityCard({ title, items, renderItem, viewAllLink }: ActivityCardProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        <Link
          href={viewAllLink}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          View all
        </Link>
      </div>
      <div className="border-t border-gray-200">
        <div className="divide-y divide-gray-200">
          {items.map((item, index) => (
            <div key={index} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 